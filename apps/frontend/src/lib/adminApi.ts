/**
 * API client for admin functionality
 * Handles all admin-related API calls with proper error handling and type safety
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'

interface ApiResponse<T = any> {
  success?: boolean
  error?: string
  message?: string
  data?: T
}

interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken') // Adjust based on your auth implementation
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  }
}

// Generic API call function
const apiCall = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers
    }
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' }))
    throw new Error(errorData.error || `HTTP ${response.status}`)
  }

  return response.json()
}

// Admin Dashboard API
export const adminDashboardApi = {
  // Get dashboard statistics
  getStats: async () => {
    return apiCall<{
      totalUsers: number
      totalApplications: number
      pendingApplications: number
      totalPortBattles: number
      activePortBattles: number
      galleryReports: number
      pendingGDPRRequests: number
      totalAuditLogs: number
    }>('/admin/users/stats')
  }
}

// User Management API
export const userManagementApi = {
  // Get all users with pagination and filtering
  getUsers: async (params: {
    page?: number
    limit?: number
    search?: string
    role?: string
    status?: string
  } = {}) => {
    const queryString = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryString.append(key, String(value))
      }
    })

    return apiCall<PaginatedResponse<{
      id: string
      username: string
      email: string
      role: string
      emailVerified: boolean
      createdAt: string
      updatedAt: string
      _count: {
        applications: number
        activityLogs: number
      }
    }>>(`/admin/users?${queryString.toString()}`)
  },

  // Update user role
  updateUserRole: async (userId: string, role: string, reason?: string) => {
    return apiCall<ApiResponse>(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role, reason })
    })
  },

  // Delete user
  deleteUser: async (userId: string, reason: string) => {
    return apiCall<ApiResponse>(`/admin/users/${userId}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason })
    })
  }
}

// Activity Logging API
export const activityApi = {
  // Get user activity logs
  getUserActivity: async (params: {
    userId?: string
    category?: string
    action?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  } = {}) => {
    const queryString = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryString.append(key, String(value))
      }
    })

    return apiCall<PaginatedResponse<{
      id: string
      timestamp: string
      userId: string
      action: string
      category: string
      resource?: string
      resourceId?: string
      details?: Record<string, any>
      ipAddress?: string
      userAgent?: string
      severity: string
      success: boolean
      user: {
        id: string
        username: string
        email: string
        role: string
      }
    }>>(`/admin/activity/user-activity?${queryString.toString()}`)
  },

  // Get activity analytics
  getAnalytics: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    return apiCall<{
      totalActivities: number
      uniqueUsers: number
      categoryCounts: Record<string, number>
      actionCounts: Record<string, number>
      dailyActivity: Array<{ date: string; count: number }>
      securityEvents: number
      errorRate: number
    }>(`/admin/activity/analytics?${params.toString()}`)
  },

  // Log a new activity
  logActivity: async (activity: {
    action: string
    category: string
    resource?: string
    resourceId?: string
    details?: Record<string, any>
  }) => {
    return apiCall<ApiResponse>('/admin/activity/log', {
      method: 'POST',
      body: JSON.stringify(activity)
    })
  }
}

// Audit Logs API
export const auditApi = {
  // Get audit logs
  getLogs: async (params: {
    adminUserId?: string
    targetUserId?: string
    action?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  } = {}) => {
    const queryString = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryString.append(key, String(value))
      }
    })

    return apiCall<PaginatedResponse<{
      id: string
      adminUserId: string
      targetUserId?: string
      action: string
      resource?: string
      resourceId?: string
      previousValue?: any
      newValue?: any
      reason?: string
      ipAddress?: string
      userAgent?: string
      success: boolean
      createdAt: string
      adminUser: {
        id: string
        username: string
        email: string
        role: string
      }
      targetUser?: {
        id: string
        username: string
        email: string
        role: string
      }
    }>>(`/admin/audit/logs?${queryString.toString()}`)
  },

  // Export audit logs
  exportLogs: async (params: {
    startDate?: string
    endDate?: string
    format?: 'csv' | 'json'
  } = {}) => {
    const queryString = new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== '')
    ).toString()

    const response = await fetch(`${API_BASE_URL}/admin/audit/export?${queryString}`, {
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error('Failed to export audit logs')
    }

    return response.blob()
  },

  // Create audit log entry
  createLog: async (log: {
    targetUserId?: string
    action: string
    resource?: string
    resourceId?: string
    previousValue?: any
    newValue?: any
    reason?: string
  }) => {
    return apiCall<ApiResponse>('/admin/audit/log', {
      method: 'POST',
      body: JSON.stringify(log)
    })
  }
}

// GDPR API
export const gdprApi = {
  // Get GDPR requests
  getRequests: async (params: {
    status?: string
    type?: string
    page?: number
    limit?: number
  } = {}) => {
    const queryString = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryString.append(key, String(value))
      }
    })

    return apiCall<PaginatedResponse<{
      id: string
      userId: string
      type: string
      status: string
      requestData?: any
      processedBy?: string
      processedAt?: string
      completedAt?: string
      downloadUrl?: string
      notes?: string
      createdAt: string
      updatedAt: string
      user: {
        id: string
        username: string
        email: string
        role: string
      }
      processor?: {
        id: string
        username: string
        email: string
      }
    }>>(`/admin/gdpr/requests?${queryString.toString()}`)
  },

  // Process GDPR request
  processRequest: async (requestId: string, status: string, notes?: string) => {
    return apiCall<ApiResponse>(`/admin/gdpr/requests/${requestId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes })
    })
  },

  // Get user data summary
  getUserDataSummary: async (userId: string) => {
    return apiCall<{
      userId: string
      email: string
      username: string
      createdAt: string
      updatedAt: string
      dataTypes: {
        profile: boolean
        applications: boolean
        activityLogs: boolean
        gdprRequests: boolean
      }
      totalDataSize: string
      counts: {
        applications: number
        activityLogs: number
        gdprRequests: number
      }
    }>(`/admin/gdpr/user-data/${userId}`)
  },

  // Export user data
  exportUserData: async (userId: string) => {
    return apiCall<{
      success: boolean
      filename: string
      downloadUrl: string
      message: string
    }>(`/admin/gdpr/export-user-data/${userId}`, {
      method: 'POST'
    })
  },

  // Delete user data
  deleteUserData: async (userId: string, reason: string, confirmDelete: boolean = true) => {
    return apiCall<{
      success: boolean
      message: string
      deletedCounts: {
        applications: number
        activityLogs: number
        gdprRequests: number
      }
    }>(`/admin/gdpr/delete-user-data/${userId}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason, confirmDelete })
    })
  },

  // Download exported data
  downloadExport: async (filename: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/gdpr/download/${filename}`, {
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error('Failed to download export')
    }

    return response.blob()
  }
}

// Roles & Permissions API
export const rolesApi = {
  // Get all roles with permissions and user counts
  getRoles: async () => {
    return apiCall<{
      id: string
      name: string
      description: string
      permissions: string[]
      userCount: number
      createdAt: string
      updatedAt: string
    }[]>('/admin/roles')
  },

  // Get available permissions
  getPermissions: async () => {
    return apiCall<{
      id: string
      name: string
      description: string
      category: string
    }[]>('/admin/permissions')
  },

  // Create new role
  createRole: async (role: {
    name: string
    description: string
    permissions: string[]
  }) => {
    return apiCall<ApiResponse>('/admin/roles', {
      method: 'POST',
      body: JSON.stringify(role)
    })
  },

  // Update role
  updateRole: async (roleId: string, updates: {
    name?: string
    description?: string
    permissions?: string[]
  }) => {
    return apiCall<ApiResponse>(`/admin/roles/${roleId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    })
  },

  // Delete role
  deleteRole: async (roleId: string) => {
    return apiCall<ApiResponse>(`/admin/roles/${roleId}`, {
      method: 'DELETE'
    })
  },

  // Assign role to user
  assignRole: async (userId: string, roleId: string) => {
    return apiCall<ApiResponse>('/admin/roles/assign', {
      method: 'POST',
      body: JSON.stringify({ userId, roleId })
    })
  },

  // Remove role from user
  removeRole: async (userId: string, roleId: string) => {
    return apiCall<ApiResponse>(`/admin/roles/${roleId}/users/${userId}`, {
      method: 'DELETE'
    })
  },

  // Get users with specific role
  getRoleUsers: async (roleId: string) => {
    return apiCall<{
      role: {
        id: string
        name: string
        description: string
        permissions: string[]
      }
      users: Array<{
        id: string
        username: string
        email: string
        firstName?: string
        lastName?: string
        assignedAt: string
        assignedBy: string
      }>
    }>(`/admin/roles/${roleId}/users`)
  }
}

// Blacklist API
export const blacklistApi = {
  // Get blacklist entries
  getBlacklist: async (params: {
    type?: 'user' | 'ip' | 'email'
    page?: number
    limit?: number
    search?: string
    active?: boolean
  } = {}) => {
    const queryString = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryString.append(key, String(value))
      }
    })

    return apiCall<PaginatedResponse<{
      id: string
      type: 'user' | 'ip' | 'email'
      value: string
      reason: string
      expiresAt?: string
      isActive: boolean
      createdAt: string
      addedBy: string
      addedByUser: {
        id: string
        username: string
        email: string
      }
    }>>(`/admin/blacklist?${queryString.toString()}`)
  },

  // Add blacklist entry
  addEntry: async (entry: {
    type: 'user' | 'ip' | 'email'
    value: string
    reason: string
    expiresAt?: string
  }) => {
    return apiCall<ApiResponse>('/admin/blacklist', {
      method: 'POST',
      body: JSON.stringify(entry)
    })
  },

  // Update blacklist entry
  updateEntry: async (entryId: string, updates: {
    reason?: string
    expiresAt?: string
    isActive?: boolean
  }) => {
    return apiCall<ApiResponse>(`/admin/blacklist/${entryId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    })
  },

  // Delete blacklist entry
  deleteEntry: async (entryId: string) => {
    return apiCall<ApiResponse>(`/admin/blacklist/${entryId}`, {
      method: 'DELETE'
    })
  },

  // Check if value is blacklisted
  checkBlacklist: async (type: 'user' | 'ip' | 'email', value: string) => {
    return apiCall<{
      isBlacklisted: boolean
      entry?: {
        id: string
        type: string
        value: string
        reason: string
        expiresAt?: string
        createdAt: string
      }
    }>(`/admin/blacklist/check?type=${type}&value=${encodeURIComponent(value)}`)
  },

  // Get blacklist statistics
  getStats: async () => {
    return apiCall<{
      totalActive: number
      totalExpired: number
      byType: {
        user?: number
        ip?: number
        email?: number
      }
    }>('/admin/blacklist/stats')
  }
}

// Gallery Reports API
export const galleryReportsApi = {
  // Get gallery reports
  getReports: async (params: {
    status?: 'pending' | 'approved' | 'rejected'
    page?: number
    limit?: number
    search?: string
  } = {}) => {
    const queryString = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryString.append(key, String(value))
      }
    })

    return apiCall<PaginatedResponse<{
      id: string
      reason: string
      status: 'pending' | 'approved' | 'rejected'
      moderatorNotes?: string
      createdAt: string
      moderatedAt?: string
      galleryItem: {
        id: string
        title: string
        description?: string
        imageUrl: string
        uploadedAt: string
        uploadedBy: {
          id: string
          username: string
          email: string
        }
      }
      reportedBy: {
        id: string
        username: string
        email: string
      }
      moderatedBy?: {
        id: string
        username: string
        email: string
      }
    }>>(`/admin/gallery-reports?${queryString.toString()}`)
  },

  // Get specific report
  getReport: async (reportId: string) => {
    return apiCall<{
      id: string
      reason: string
      status: 'pending' | 'approved' | 'rejected'
      moderatorNotes?: string
      createdAt: string
      moderatedAt?: string
      galleryItem: {
        id: string
        title: string
        description?: string
        imageUrl: string
        uploadedAt: string
        uploadedBy: {
          id: string
          username: string
          email: string
          createdAt: string
        }
      }
      reportedBy: {
        id: string
        username: string
        email: string
        createdAt: string
      }
      moderatedBy?: {
        id: string
        username: string
        email: string
      }
    }>(`/admin/gallery-reports/${reportId}`)
  },

  // Update report status (approve/reject)
  updateReport: async (reportId: string, status: 'approved' | 'rejected', moderatorNotes?: string) => {
    return apiCall<ApiResponse>(`/admin/gallery-reports/${reportId}`, {
      method: 'PUT',
      body: JSON.stringify({ status, moderatorNotes })
    })
  },

  // Delete report
  deleteReport: async (reportId: string) => {
    return apiCall<ApiResponse>(`/admin/gallery-reports/${reportId}`, {
      method: 'DELETE'
    })
  },

  // Get statistics
  getStats: async () => {
    return apiCall<{
      pending: number
      approved: number
      rejected: number
      recent24h: number
      topReporters: Array<{
        user: {
          id: string
          username: string
          email: string
        }
        reportCount: number
      }>
    }>('/admin/gallery-reports/stats')
  },

  // Bulk process reports
  bulkProcess: async (reportIds: string[], status: 'approved' | 'rejected', moderatorNotes?: string) => {
    return apiCall<ApiResponse>('/admin/gallery-reports/bulk', {
      method: 'POST',
      body: JSON.stringify({ reportIds, status, moderatorNotes })
    })
  }
}

// Port Battles API
export const portBattlesApi = {
  // Get port battles
  getBattles: async (params: {
    status?: 'scheduled' | 'active' | 'completed' | 'cancelled'
    page?: number
    limit?: number
    search?: string
    server?: string
    upcoming?: boolean
  } = {}) => {
    const queryString = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryString.append(key, String(value))
      }
    })

    return apiCall<PaginatedResponse<{
      id: string
      name: string
      description: string
      port: string
      server: string
      scheduledTime: string
      status: 'scheduled' | 'active' | 'completed' | 'cancelled'
      maxParticipants?: number
      requirements?: string
      rewards?: string
      createdAt: string
      createdBy: {
        id: string
        username: string
        email: string
      }
      participants: Array<{
        userId: string
        shipType?: string
        notes?: string
        joinedAt: string
        user: {
          id: string
          username: string
          email: string
        }
      }>
      _count: {
        participants: number
      }
    }>>(`/admin/port-battles?${queryString.toString()}`)
  },

  // Get specific port battle
  getBattle: async (battleId: string) => {
    return apiCall<{
      id: string
      name: string
      description: string
      port: string
      server: string
      scheduledTime: string
      status: 'scheduled' | 'active' | 'completed' | 'cancelled'
      maxParticipants?: number
      requirements?: string
      rewards?: string
      createdAt: string
      createdBy: {
        id: string
        username: string
        email: string
        createdAt: string
      }
      participants: Array<{
        userId: string
        shipType?: string
        notes?: string
        joinedAt: string
        addedBy: string
        user: {
          id: string
          username: string
          email: string
          firstName?: string
          lastName?: string
        }
      }>
    }>(`/admin/port-battles/${battleId}`)
  },

  // Create port battle
  createBattle: async (battle: {
    name: string
    description: string
    scheduledTime: string
    port: string
    server: string
    maxParticipants?: number
    requirements?: string
    rewards?: string
  }) => {
    return apiCall<ApiResponse>('/admin/port-battles', {
      method: 'POST',
      body: JSON.stringify(battle)
    })
  },

  // Update port battle
  updateBattle: async (battleId: string, updates: {
    name?: string
    description?: string
    scheduledTime?: string
    port?: string
    server?: string
    maxParticipants?: number
    requirements?: string
    rewards?: string
    status?: 'scheduled' | 'active' | 'completed' | 'cancelled'
  }) => {
    return apiCall<ApiResponse>(`/admin/port-battles/${battleId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    })
  },

  // Delete port battle
  deleteBattle: async (battleId: string) => {
    return apiCall<ApiResponse>(`/admin/port-battles/${battleId}`, {
      method: 'DELETE'
    })
  },

  // Add participant
  addParticipant: async (battleId: string, participant: {
    userId: string
    shipType?: string
    notes?: string
  }) => {
    return apiCall<ApiResponse>(`/admin/port-battles/${battleId}/participants`, {
      method: 'POST',
      body: JSON.stringify(participant)
    })
  },

  // Remove participant
  removeParticipant: async (battleId: string, userId: string) => {
    return apiCall<ApiResponse>(`/admin/port-battles/${battleId}/participants/${userId}`, {
      method: 'DELETE'
    })
  },

  // Get statistics
  getStats: async () => {
    return apiCall<{
      statusCounts: {
        scheduled: number
        active: number
        completed: number
        cancelled: number
      }
      upcoming: number
      totalParticipants: number
      upcomingBattles: Array<{
        id: string
        name: string
        port: string
        server: string
        scheduledTime: string
        _count: {
          participants: number
        }
      }>
      popularServers: Array<{
        server: string
        battleCount: number
      }>
    }>('/admin/port-battles/stats')
  },

  // Attendance tracking
  getAttendance: async (battleId: string) => {
    return apiCall<Array<{
      id: string
      userId: string
      battleId: string
      attended: boolean
      shipType?: string
      notes?: string
      recordedAt: string
      recordedBy: string
      user: {
        id: string
        username: string
        email: string
        firstName?: string
        lastName?: string
      }
    }>>(`/admin/port-battles/${battleId}/attendance`)
  },

  markAttendance: async (battleId: string, attendanceData: Array<{
    userId: string
    attended: boolean
    shipType?: string
    notes?: string
  }>) => {
    return apiCall<ApiResponse>(`/admin/port-battles/${battleId}/attendance`, {
      method: 'POST',
      body: JSON.stringify({ attendanceData })
    })
  },

  // After Action Reports (AARs)
  getAARs: async (battleId: string) => {
    return apiCall<Array<{
      id: string
      battleId: string
      title: string
      summary: string
      outcome: 'victory' | 'defeat' | 'draw' | 'cancelled'
      lessons: string
      recommendations: string
      createdAt: string
      createdBy: string
      author: {
        id: string
        username: string
        email: string
      }
    }>>(`/admin/port-battles/${battleId}/aars`)
  },

  createAAR: async (battleId: string, aar: {
    title: string
    summary: string
    outcome: 'victory' | 'defeat' | 'draw' | 'cancelled'
    lessons: string
    recommendations: string
  }) => {
    return apiCall<ApiResponse>(`/admin/port-battles/${battleId}/aars`, {
      method: 'POST',
      body: JSON.stringify(aar)
    })
  },

  updateAAR: async (battleId: string, aarId: string, updates: {
    title?: string
    summary?: string
    outcome?: 'victory' | 'defeat' | 'draw' | 'cancelled'
    lessons?: string
    recommendations?: string
  }) => {
    return apiCall<ApiResponse>(`/admin/port-battles/${battleId}/aars/${aarId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    })
  },

  deleteAAR: async (battleId: string, aarId: string) => {
    return apiCall<ApiResponse>(`/admin/port-battles/${battleId}/aars/${aarId}`, {
      method: 'DELETE'
    })
  }
}

// Helper function to download blob as file
export const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}
