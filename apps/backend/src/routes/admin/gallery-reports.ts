import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Extend the FastifyRequest interface to include user
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string
      email: string
      username: string
    }
  }
}

interface ReportQuery {
  status?: 'pending' | 'approved' | 'rejected'
  page?: number
  limit?: number
  search?: string
}

interface UpdateReportRequest {
  status: 'approved' | 'rejected'
  moderatorNotes?: string
}

export default async function galleryReportsRoutes(fastify: FastifyInstance) {
  // Get all gallery reports with filtering and pagination
  fastify.get<{ Querystring: ReportQuery }>('/gallery-reports', async (request: FastifyRequest<{ Querystring: ReportQuery }>, reply: FastifyReply) => {
    try {
      const { status, page = 1, limit = 20, search } = request.query
      const skip = (page - 1) * limit

      const where: any = {}

      if (status) {
        where.status = status
      }

      if (search) {
        where.OR = [
          { reason: { contains: search, mode: 'insensitive' } },
          { moderatorNotes: { contains: search, mode: 'insensitive' } },
          {
            galleryItem: {
              title: { contains: search, mode: 'insensitive' }
            }
          },
          {
            reportedBy: {
              username: { contains: search, mode: 'insensitive' }
            }
          }
        ]
      }

      const [reports, total] = await Promise.all([
        prisma.galleryReport.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            galleryItem: {
              select: {
                id: true,
                title: true,
                description: true,
                imageUrl: true,
                uploadedAt: true,
                uploadedBy: {
                  select: {
                    id: true,
                    username: true,
                    email: true
                  }
                }
              }
            },
            reportedBy: {
              select: {
                id: true,
                username: true,
                email: true
              }
            },
            moderatedBy: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          }
        }),
        prisma.galleryReport.count({ where })
      ])

      const pagination = {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }

      return { data: { items: reports, pagination } }
    } catch (error) {
      fastify.log.error('Error fetching gallery reports:', error)
      return reply.status(500).send({ error: 'Failed to fetch gallery reports' })
    }
  })

  // Get specific gallery report
  fastify.get<{ Params: { reportId: string } }>('/gallery-reports/:reportId', async (request: FastifyRequest<{ Params: { reportId: string } }>, reply: FastifyReply) => {
    try {
      const { reportId } = request.params

      const report = await prisma.galleryReport.findUnique({
        where: { id: reportId },
        include: {
          galleryItem: {
            include: {
              uploadedBy: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                  createdAt: true
                }
              }
            }
          },
          reportedBy: {
            select: {
              id: true,
              username: true,
              email: true,
              createdAt: true
            }
          },
          moderatedBy: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        }
      })

      if (!report) {
        return reply.status(404).send({ error: 'Gallery report not found' })
      }

      return { data: report }
    } catch (error) {
      fastify.log.error('Error fetching gallery report:', error)
      return reply.status(500).send({ error: 'Failed to fetch gallery report' })
    }
  })

  // Update report status (approve/reject)
  fastify.put<{ Params: { reportId: string }, Body: UpdateReportRequest }>('/gallery-reports/:reportId', async (request: FastifyRequest<{ Params: { reportId: string }, Body: UpdateReportRequest }>, reply: FastifyReply) => {
    try {
      const { reportId } = request.params
      const { status, moderatorNotes } = request.body

      if (!status || !['approved', 'rejected'].includes(status)) {
        return reply.status(400).send({ error: 'Valid status (approved/rejected) is required' })
      }

      const existingReport = await prisma.galleryReport.findUnique({
        where: { id: reportId },
        include: {
          galleryItem: true,
          reportedBy: {
            select: { id: true, username: true, email: true }
          }
        }
      })

      if (!existingReport) {
        return reply.status(404).send({ error: 'Gallery report not found' })
      }

      if (existingReport.status !== 'pending') {
        return reply.status(400).send({ error: 'Report has already been processed' })
      }

      // Start a transaction to update report and potentially remove gallery item
      const result = await prisma.$transaction(async (tx: any) => {
        // Update the report
        const updatedReport = await tx.galleryReport.update({
          where: { id: reportId },
          data: {
            status,
            moderatorNotes,
            moderatedBy: request.user?.id || 'system',
            moderatedAt: new Date()
          },
          include: {
            galleryItem: true,
            reportedBy: {
              select: { id: true, username: true, email: true }
            },
            moderatedBy: {
              select: { id: true, username: true, email: true }
            }
          }
        })

        // If approved (meaning the report was valid), remove the gallery item
        if (status === 'approved') {
          await tx.galleryItem.delete({
            where: { id: existingReport.galleryItem.id }
          })
        }

        return updatedReport
      })

      // Log the action
      await prisma.auditLog.create({
        data: {
          action: 'GALLERY_REPORT_MODERATE',
          category: 'moderation',
          adminUserId: request.user?.id || 'system',
          adminUserEmail: request.user?.email || 'system',
          adminUserName: request.user?.username || 'system',
          targetUserId: existingReport.reportedBy.id,
          targetUserEmail: existingReport.reportedBy.email,
          details: {
            reportId,
            galleryItemId: existingReport.galleryItem.id,
            galleryItemTitle: existingReport.galleryItem.title,
            decision: status,
            moderatorNotes,
            originalReason: existingReport.reason
          },
          ipAddress: request.ip
        }
      })

      return { data: result }
    } catch (error) {
      fastify.log.error('Error updating gallery report:', error)
      return reply.status(500).send({ error: 'Failed to update gallery report' })
    }
  })

  // Delete gallery report
  fastify.delete<{ Params: { reportId: string } }>('/gallery-reports/:reportId', async (request: FastifyRequest<{ Params: { reportId: string } }>, reply: FastifyReply) => {
    try {
      const { reportId } = request.params

      const report = await prisma.galleryReport.findUnique({
        where: { id: reportId },
        include: {
          galleryItem: {
            select: { id: true, title: true }
          },
          reportedBy: {
            select: { id: true, username: true, email: true }
          }
        }
      })

      if (!report) {
        return reply.status(404).send({ error: 'Gallery report not found' })
      }

      await prisma.galleryReport.delete({
        where: { id: reportId }
      })

      // Log the action
      await prisma.auditLog.create({
        data: {
          action: 'GALLERY_REPORT_DELETE',
          category: 'moderation',
          adminUserId: request.user?.id || 'system',
          adminUserEmail: request.user?.email || 'system',
          adminUserName: request.user?.username || 'system',
          details: {
            reportId,
            galleryItemId: report.galleryItem.id,
            galleryItemTitle: report.galleryItem.title,
            reason: report.reason,
            reportedBy: report.reportedBy.username
          },
          ipAddress: request.ip
        }
      })

      return { message: 'Gallery report deleted successfully' }
    } catch (error) {
      fastify.log.error('Error deleting gallery report:', error)
      return reply.status(500).send({ error: 'Failed to delete gallery report' })
    }
  })

  // Get gallery reports statistics
  fastify.get('/gallery-reports/stats', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const [pendingCount, approvedCount, rejectedCount, recentReports] = await Promise.all([
        prisma.galleryReport.count({ where: { status: 'pending' } }),
        prisma.galleryReport.count({ where: { status: 'approved' } }),
        prisma.galleryReport.count({ where: { status: 'rejected' } }),
        prisma.galleryReport.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          }
        })
      ])

      // Get top reporters (users who report most frequently)
      const topReporters = await prisma.galleryReport.groupBy({
        by: ['reportedById'],
        _count: { reportedById: true },
        orderBy: { _count: { reportedById: 'desc' } },
        take: 5
      })

      // Get reporter details
      const reporterIds = topReporters.map((r: any) => r.reportedById).filter(Boolean)
      const reporterDetails = await prisma.user.findMany({
        where: { id: { in: reporterIds } },
        select: { id: true, username: true, email: true }
      })

      const topReportersWithDetails = topReporters.map((r: any) => ({
        user: reporterDetails.find((u: any) => u.id === r.reportedById),
        reportCount: r._count.reportedById
      }))

      return {
        data: {
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount,
          recent24h: recentReports,
          topReporters: topReportersWithDetails
        }
      }
    } catch (error) {
      fastify.log.error('Error fetching gallery reports stats:', error)
      return reply.status(500).send({ error: 'Failed to fetch gallery reports statistics' })
    }
  })

  // Bulk process reports
  fastify.post<{ Body: { reportIds: string[], status: 'approved' | 'rejected', moderatorNotes?: string } }>('/gallery-reports/bulk', async (request: FastifyRequest<{ Body: { reportIds: string[], status: 'approved' | 'rejected', moderatorNotes?: string } }>, reply: FastifyReply) => {
    try {
      const { reportIds, status, moderatorNotes } = request.body

      if (!reportIds || !Array.isArray(reportIds) || reportIds.length === 0) {
        return reply.status(400).send({ error: 'Report IDs array is required' })
      }

      if (!status || !['approved', 'rejected'].includes(status)) {
        return reply.status(400).send({ error: 'Valid status (approved/rejected) is required' })
      }

      // Get all reports to be processed
      const reports = await prisma.galleryReport.findMany({
        where: {
          id: { in: reportIds },
          status: 'pending'
        },
        include: {
          galleryItem: true,
          reportedBy: {
            select: { id: true, username: true, email: true }
          }
        }
      })

      if (reports.length === 0) {
        return reply.status(400).send({ error: 'No pending reports found for the provided IDs' })
      }

      // Process all reports in a transaction
      const results = await prisma.$transaction(async (tx: any) => {
        const updatedReports = []

        for (const report of reports) {
          // Update the report
          const updatedReport = await tx.galleryReport.update({
            where: { id: report.id },
            data: {
              status,
              moderatorNotes,
              moderatedBy: request.user?.id || 'system',
              moderatedAt: new Date()
            }
          })

          // If approved, remove the gallery item
          if (status === 'approved') {
            await tx.galleryItem.delete({
              where: { id: report.galleryItem.id }
            })
          }

          updatedReports.push(updatedReport)

          // Log each action
          await tx.auditLog.create({
            data: {
              action: 'GALLERY_REPORT_BULK_MODERATE',
              category: 'moderation',
              adminUserId: request.user?.id || 'system',
              adminUserEmail: request.user?.email || 'system',
              adminUserName: request.user?.username || 'system',
              targetUserId: report.reportedBy.id,
              targetUserEmail: report.reportedBy.email,
              details: {
                reportId: report.id,
                galleryItemId: report.galleryItem.id,
                galleryItemTitle: report.galleryItem.title,
                decision: status,
                moderatorNotes,
                originalReason: report.reason,
                bulkOperation: true
              },
              ipAddress: request.ip
            }
          })
        }

        return updatedReports
      })

      return {
        data: results,
        message: `Successfully processed ${results.length} reports`
      }
    } catch (error) {
      fastify.log.error('Error bulk processing gallery reports:', error)
      return reply.status(500).send({ error: 'Failed to bulk process gallery reports' })
    }
  })
}
