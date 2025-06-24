# Monitoring and Alerting Configuration

This directory contains monitoring, logging, and alerting configurations for the KrakenGaming platform.

## Components

### Google Cloud Monitoring
- **Metrics**: Custom metrics for application performance, user engagement, and system health
- **Alerting**: Automated alerts for critical issues, performance degradation, and security events
- **Dashboards**: Real-time dashboards for operations team and stakeholders

### Sentry Integration
- **Error Tracking**: Automatic error capture and reporting across all services
- **Performance Monitoring**: Real-time performance metrics and transaction tracing
- **Release Tracking**: Deploy tracking and error attribution to specific releases

### Log Aggregation
- **Structured Logging**: JSON-formatted logs with correlation IDs
- **Centralized Collection**: All logs aggregated in Google Cloud Logging
- **Log-based Metrics**: Custom metrics derived from log patterns

### Health Checks
- **Kubernetes Probes**: Liveness and readiness probes for all services
- **External Monitoring**: Third-party uptime monitoring (Pingdom, StatusCake, etc.)
- **Synthetic Transactions**: Automated testing of critical user journeys

## Configuration Files

### monitoring/alerts/
- `application-alerts.yml` - Application-level alerting rules
- `infrastructure-alerts.yml` - Infrastructure and resource alerting
- `security-alerts.yml` - Security and compliance monitoring

### monitoring/dashboards/
- `operations-dashboard.json` - Operations team dashboard
- `business-metrics-dashboard.json` - Key business metrics
- `security-dashboard.json` - Security monitoring dashboard

### monitoring/metrics/
- `custom-metrics.yml` - Custom application metrics configuration
- `sli-slo-config.yml` - Service Level Indicators and Objectives

## Setup Instructions

1. **Google Cloud Monitoring**:
   ```bash
   gcloud services enable monitoring.googleapis.com
   gcloud services enable logging.googleapis.com
   ```

2. **Sentry Setup**:
   ```bash
   # Set Sentry DSN in environment variables
   export SENTRY_DSN="your-sentry-dsn-here"
   export SENTRY_ORG="krakengaming"
   export SENTRY_PROJECT="krakengaming-web"
   ```

3. **Deploy Monitoring Configuration**:
   ```bash
   # Deploy custom metrics
   kubectl apply -f monitoring/metrics/

   # Deploy alerting rules
   kubectl apply -f monitoring/alerts/

   # Import dashboards
   gcloud monitoring dashboards create --config-from-file=monitoring/dashboards/operations-dashboard.json
   ```

## Key Metrics Monitored

### Application Metrics
- Request latency (p95, p99)
- Error rates and types
- Throughput (requests/second)
- User session duration
- Database query performance

### Infrastructure Metrics
- CPU and memory utilization
- Network I/O and bandwidth
- Disk usage and IOPS
- Container restart counts
- Cloud Run cold starts

### Business Metrics
- User registrations
- Discord bot commands executed
- API endpoint usage
- Feature adoption rates

### Security Metrics
- Authentication failures
- Suspicious IP addresses
- Rate limit violations
- Security scan results

## Alerting Strategy

### Critical Alerts (Immediate Response)
- Service completely down
- Database connectivity lost
- Critical security breach
- P99 latency > 5 seconds

### Warning Alerts (Within 30 minutes)
- Error rate > 5%
- Memory usage > 80%
- Disk usage > 85%
- High rate of 4xx errors

### Info Alerts (Within 24 hours)
- Deployment completed
- Unusual traffic patterns
- Performance degradation
- Resource usage trends

## Runbooks

### Common Issues
1. **High Error Rate**: Check recent deployments, database status, external service dependencies
2. **High Latency**: Review slow queries, check Cloud Run scaling, verify external API status
3. **Service Down**: Check Cloud Run logs, verify configuration, check resource limits
4. **Database Issues**: Review connection pools, check query performance, verify credentials

### Escalation Process
1. **L1**: Automated monitoring alerts → On-call engineer
2. **L2**: Complex issues → Senior engineers and team leads
3. **L3**: Critical business impact → Engineering management and leadership

## Maintenance

### Regular Tasks
- Review and update alerting thresholds monthly
- Analyze monitoring data for optimization opportunities
- Update runbooks based on incident learnings
- Validate monitoring coverage for new features

### Quarterly Reviews
- Assess SLI/SLO achievement
- Review monitoring costs and optimization
- Update dashboard layouts and metrics
- Conduct alerting fatigue analysis
