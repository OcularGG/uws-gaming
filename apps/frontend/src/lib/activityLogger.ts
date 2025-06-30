/**
 * Comprehensive logging system for admin and user activities
 * This provides the foundation for real audit logs and user activity tracking
 */

export interface LogEntry {
  id: string
  timestamp: string
  userId: string
  userEmail?: string
  userName?: string
  action: string
  category: 'auth' | 'admin' | 'user' | 'system' | 'security' | 'gdpr'
  resource?: string
  resourceId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  success: boolean
  metadata?: Record<string, any>
}

export interface AuditLogEntry extends LogEntry {
  adminUserId: string
  adminUserEmail?: string
  adminUserName?: string
  targetUserId?: string
  targetUserEmail?: string
  previousValue?: any
  newValue?: any
  reason?: string
}

export class ActivityLogger {
  private static instance: ActivityLogger
  private logs: LogEntry[] = []
  private auditLogs: AuditLogEntry[] = []

  private constructor() {}

  public static getInstance(): ActivityLogger {
    if (!ActivityLogger.instance) {
      ActivityLogger.instance = new ActivityLogger()
    }
    return ActivityLogger.instance
  }

  /**
   * Log a user activity
   */
  public logUserActivity(
    userId: string,
    action: string,
    category: LogEntry['category'] = 'user',
    details?: Record<string, any>,
    request?: any
  ): void {
    const logEntry: LogEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      userId,
      action,
      category,
      details,
      ipAddress: this.extractIpAddress(request),
      userAgent: this.extractUserAgent(request),
      sessionId: this.extractSessionId(request),
      severity: 'info',
      success: true
    }

    this.logs.push(logEntry)
    this.persistLog(logEntry)
  }

  /**
   * Log an admin action (for audit trail)
   */
  public logAdminAction(
    adminUserId: string,
    action: string,
    details?: Record<string, any>,
    targetUserId?: string,
    previousValue?: any,
    newValue?: any,
    reason?: string,
    request?: any
  ): void {
    const auditEntry: AuditLogEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      userId: adminUserId,
      adminUserId,
      action,
      category: 'admin',
      details,
      targetUserId,
      previousValue,
      newValue,
      reason,
      ipAddress: this.extractIpAddress(request),
      userAgent: this.extractUserAgent(request),
      sessionId: this.extractSessionId(request),
      severity: 'info',
      success: true
    }

    this.auditLogs.push(auditEntry)
    this.persistAuditLog(auditEntry)
  }

  /**
   * Log a security event
   */
  public logSecurityEvent(
    userId: string,
    action: string,
    severity: LogEntry['severity'] = 'warning',
    details?: Record<string, any>,
    request?: any
  ): void {
    const logEntry: LogEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      userId,
      action,
      category: 'security',
      details,
      ipAddress: this.extractIpAddress(request),
      userAgent: this.extractUserAgent(request),
      sessionId: this.extractSessionId(request),
      severity,
      success: false
    }

    this.logs.push(logEntry)
    this.persistLog(logEntry)

    // Send alerts for critical security events
    if (severity === 'critical') {
      this.sendSecurityAlert(logEntry)
    }
  }

  /**
   * Log GDPR-related activities
   */
  public logGDPRActivity(
    userId: string,
    action: string,
    details?: Record<string, any>,
    adminUserId?: string,
    request?: any
  ): void {
    const logEntry: LogEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      userId: adminUserId || userId,
      action,
      category: 'gdpr',
      details: {
        ...details,
        targetUserId: userId,
        isAdminAction: !!adminUserId
      },
      ipAddress: this.extractIpAddress(request),
      userAgent: this.extractUserAgent(request),
      sessionId: this.extractSessionId(request),
      severity: 'info',
      success: true
    }

    this.logs.push(logEntry)
    this.persistLog(logEntry)
  }

  /**
   * Get user activity logs with filtering
   */
  public getUserActivityLogs(
    filters: {
      userId?: string
      category?: LogEntry['category']
      startDate?: string
      endDate?: string
      action?: string
      limit?: number
    } = {}
  ): LogEntry[] {
    let filteredLogs = [...this.logs]

    if (filters.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filters.userId)
    }

    if (filters.category) {
      filteredLogs = filteredLogs.filter(log => log.category === filters.category)
    }

    if (filters.action) {
      filteredLogs = filteredLogs.filter(log =>
        log.action.toLowerCase().includes(filters.action!.toLowerCase())
      )
    }

    if (filters.startDate) {
      filteredLogs = filteredLogs.filter(log =>
        new Date(log.timestamp) >= new Date(filters.startDate!)
      )
    }

    if (filters.endDate) {
      filteredLogs = filteredLogs.filter(log =>
        new Date(log.timestamp) <= new Date(filters.endDate!)
      )
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    if (filters.limit) {
      filteredLogs = filteredLogs.slice(0, filters.limit)
    }

    return filteredLogs
  }

  /**
   * Get audit logs with filtering
   */
  public getAuditLogs(
    filters: {
      adminUserId?: string
      targetUserId?: string
      action?: string
      startDate?: string
      endDate?: string
      limit?: number
    } = {}
  ): AuditLogEntry[] {
    let filteredLogs = [...this.auditLogs]

    if (filters.adminUserId) {
      filteredLogs = filteredLogs.filter(log => log.adminUserId === filters.adminUserId)
    }

    if (filters.targetUserId) {
      filteredLogs = filteredLogs.filter(log => log.targetUserId === filters.targetUserId)
    }

    if (filters.action) {
      filteredLogs = filteredLogs.filter(log =>
        log.action.toLowerCase().includes(filters.action!.toLowerCase())
      )
    }

    if (filters.startDate) {
      filteredLogs = filteredLogs.filter(log =>
        new Date(log.timestamp) >= new Date(filters.startDate!)
      )
    }

    if (filters.endDate) {
      filteredLogs = filteredLogs.filter(log =>
        new Date(log.timestamp) <= new Date(filters.endDate!)
      )
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    if (filters.limit) {
      filteredLogs = filteredLogs.slice(0, filters.limit)
    }

    return filteredLogs
  }

  /**
   * Generate analytics data from logs
   */
  public getActivityAnalytics(startDate?: string, endDate?: string) {
    const filteredLogs = this.getUserActivityLogs({ startDate, endDate })

    const analytics = {
      totalActivities: filteredLogs.length,
      uniqueUsers: new Set(filteredLogs.map(log => log.userId)).size,
      categoryCounts: {} as Record<string, number>,
      actionCounts: {} as Record<string, number>,
      dailyActivity: {} as Record<string, number>,
      securityEvents: filteredLogs.filter(log => log.category === 'security').length,
      errorRate: filteredLogs.filter(log => !log.success).length / filteredLogs.length
    }

    // Count by category
    filteredLogs.forEach(log => {
      analytics.categoryCounts[log.category] = (analytics.categoryCounts[log.category] || 0) + 1
    })

    // Count by action
    filteredLogs.forEach(log => {
      analytics.actionCounts[log.action] = (analytics.actionCounts[log.action] || 0) + 1
    })

    // Count by day
    filteredLogs.forEach(log => {
      const day = new Date(log.timestamp).toISOString().split('T')[0]
      analytics.dailyActivity[day] = (analytics.dailyActivity[day] || 0) + 1
    })

    return analytics
  }

  private generateId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private extractIpAddress(request?: any): string | undefined {
    if (!request) return undefined
    return request.ip || request.connection?.remoteAddress || request.headers?.['x-forwarded-for']
  }

  private extractUserAgent(request?: any): string | undefined {
    if (!request) return undefined
    return request.headers?.['user-agent']
  }

  private extractSessionId(request?: any): string | undefined {
    if (!request) return undefined
    return request.sessionID || request.session?.id
  }

  private async persistLog(logEntry: LogEntry): Promise<void> {
    try {
      // In a real implementation, you would save to database
      // For now, we'll just log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Activity Log:', logEntry)
      }

      // TODO: Implement database persistence
      // await db.activityLog.create({ data: logEntry })

      // TODO: Send to external logging service (like Sentry, LogRocket, etc.)
      // await externalLogger.send(logEntry)
    } catch (error) {
      console.error('Failed to persist log entry:', error)
    }
  }

  private async persistAuditLog(auditEntry: AuditLogEntry): Promise<void> {
    try {
      // In a real implementation, you would save to database
      // For now, we'll just log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Audit Log:', auditEntry)
      }

      // TODO: Implement database persistence
      // await db.auditLog.create({ data: auditEntry })

      // TODO: Send to external audit service
      // await auditService.send(auditEntry)
    } catch (error) {
      console.error('Failed to persist audit log entry:', error)
    }
  }

  private async sendSecurityAlert(logEntry: LogEntry): Promise<void> {
    try {
      // TODO: Implement security alerting
      // - Send email to security team
      // - Send Slack notification
      // - Create incident in monitoring system
      console.warn('SECURITY ALERT:', logEntry)
    } catch (error) {
      console.error('Failed to send security alert:', error)
    }
  }
}

// Pre-defined action constants for consistency
export const USER_ACTIONS = {
  // Authentication
  LOGIN: 'user_login',
  LOGOUT: 'user_logout',
  LOGIN_FAILED: 'user_login_failed',
  PASSWORD_CHANGE: 'user_password_change',
  PASSWORD_RESET_REQUEST: 'user_password_reset_request',
  PASSWORD_RESET_COMPLETE: 'user_password_reset_complete',

  // Profile
  PROFILE_UPDATE: 'user_profile_update',
  AVATAR_UPLOAD: 'user_avatar_upload',
  EMAIL_CHANGE: 'user_email_change',
  EMAIL_VERIFICATION: 'user_email_verification',

  // Content
  POST_CREATE: 'user_post_create',
  POST_UPDATE: 'user_post_update',
  POST_DELETE: 'user_post_delete',
  COMMENT_CREATE: 'user_comment_create',
  COMMENT_UPDATE: 'user_comment_update',
  COMMENT_DELETE: 'user_comment_delete',

  // Gallery
  IMAGE_UPLOAD: 'user_image_upload',
  IMAGE_DELETE: 'user_image_delete',
  IMAGE_REPORT: 'user_image_report',

  // Port Battles
  PORT_BATTLE_JOIN: 'user_port_battle_join',
  PORT_BATTLE_LEAVE: 'user_port_battle_leave',
  PORT_BATTLE_CREATE: 'user_port_battle_create',

  // Applications
  APPLICATION_SUBMIT: 'user_application_submit',
  APPLICATION_UPDATE: 'user_application_update',
  APPLICATION_WITHDRAW: 'user_application_withdraw'
} as const

export const ADMIN_ACTIONS = {
  // User Management
  USER_CREATE: 'admin_user_create',
  USER_UPDATE: 'admin_user_update',
  USER_DELETE: 'admin_user_delete',
  USER_BAN: 'admin_user_ban',
  USER_UNBAN: 'admin_user_unban',
  USER_ROLE_CHANGE: 'admin_user_role_change',
  USER_PERMISSION_CHANGE: 'admin_user_permission_change',

  // Content Moderation
  POST_APPROVE: 'admin_post_approve',
  POST_REJECT: 'admin_post_reject',
  POST_DELETE: 'admin_post_delete',
  COMMENT_DELETE: 'admin_comment_delete',
  IMAGE_DELETE: 'admin_image_delete',
  REPORT_RESOLVE: 'admin_report_resolve',

  // Applications
  APPLICATION_REVIEW: 'admin_application_review',
  APPLICATION_APPROVE: 'admin_application_approve',
  APPLICATION_REJECT: 'admin_application_reject',

  // Port Battles
  PORT_BATTLE_CREATE: 'admin_port_battle_create',
  PORT_BATTLE_UPDATE: 'admin_port_battle_update',
  PORT_BATTLE_DELETE: 'admin_port_battle_delete',
  PORT_BATTLE_MANAGE: 'admin_port_battle_manage',

  // System
  SETTINGS_UPDATE: 'admin_settings_update',
  BACKUP_CREATE: 'admin_backup_create',
  MAINTENANCE_MODE: 'admin_maintenance_mode',

  // GDPR
  GDPR_DATA_EXPORT: 'admin_gdpr_data_export',
  GDPR_DATA_DELETE: 'admin_gdpr_data_delete',
  GDPR_REQUEST_PROCESS: 'admin_gdpr_request_process'
} as const

export const SECURITY_ACTIONS = {
  SUSPICIOUS_LOGIN: 'security_suspicious_login',
  MULTIPLE_FAILED_LOGINS: 'security_multiple_failed_logins',
  IP_BLOCKED: 'security_ip_blocked',
  RATE_LIMIT_EXCEEDED: 'security_rate_limit_exceeded',
  UNAUTHORIZED_ACCESS_ATTEMPT: 'security_unauthorized_access_attempt',
  SQL_INJECTION_ATTEMPT: 'security_sql_injection_attempt',
  XSS_ATTEMPT: 'security_xss_attempt',
  CSRF_TOKEN_MISMATCH: 'security_csrf_token_mismatch',
  SESSION_HIJACK_ATTEMPT: 'security_session_hijack_attempt'
} as const

// Export singleton instance
export const activityLogger = ActivityLogger.getInstance()

// Helper functions for common logging scenarios
export const logUserLogin = (userId: string, request?: any) => {
  activityLogger.logUserActivity(userId, USER_ACTIONS.LOGIN, 'auth', {}, request)
}

export const logUserLogout = (userId: string, request?: any) => {
  activityLogger.logUserActivity(userId, USER_ACTIONS.LOGOUT, 'auth', {}, request)
}

export const logFailedLogin = (email: string, request?: any) => {
  activityLogger.logSecurityEvent(email, USER_ACTIONS.LOGIN_FAILED, 'warning', { email }, request)
}

export const logAdminUserRoleChange = (
  adminId: string,
  targetUserId: string,
  oldRole: string,
  newRole: string,
  reason?: string,
  request?: any
) => {
  activityLogger.logAdminAction(
    adminId,
    ADMIN_ACTIONS.USER_ROLE_CHANGE,
    { oldRole, newRole },
    targetUserId,
    oldRole,
    newRole,
    reason,
    request
  )
}

export const logGDPRDataExport = (userId: string, adminId?: string, request?: any) => {
  activityLogger.logGDPRActivity(
    userId,
    adminId ? ADMIN_ACTIONS.GDPR_DATA_EXPORT : 'user_gdpr_data_export_request',
    { requestType: 'data_export' },
    adminId,
    request
  )
}
