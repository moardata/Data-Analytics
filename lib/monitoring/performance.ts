/**
 * Performance Monitoring System
 * Tracks system performance metrics and provides optimization insights
 */

export interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  timestamp: string;
}

export interface PerformanceAlert {
  type: 'response_time' | 'throughput' | 'error_rate' | 'memory' | 'cpu';
  severity: 'warning' | 'error' | 'critical';
  message: string;
  threshold: number;
  actual: number;
  timestamp: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private alerts: PerformanceAlert[] = [];
  private readonly maxMetrics = 1000; // Keep last 1000 metrics

  // Thresholds
  private readonly thresholds = {
    responseTime: 2000, // 2 seconds
    throughput: 100, // requests per minute
    errorRate: 5, // 5%
    memoryUsage: 80, // 80%
    cpuUsage: 80 // 80%
  };

  recordMetric(metric: Omit<PerformanceMetrics, 'timestamp'>) {
    const fullMetric: PerformanceMetrics = {
      ...metric,
      timestamp: new Date().toISOString()
    };

    this.metrics.push(fullMetric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Check for alerts
    this.checkAlerts(fullMetric);
  }

  private checkAlerts(metric: PerformanceMetrics) {
    // Response time alert
    if (metric.responseTime > this.thresholds.responseTime) {
      this.addAlert({
        type: 'response_time',
        severity: metric.responseTime > this.thresholds.responseTime * 2 ? 'critical' : 'warning',
        message: `Response time is ${metric.responseTime}ms (threshold: ${this.thresholds.responseTime}ms)`,
        threshold: this.thresholds.responseTime,
        actual: metric.responseTime,
        timestamp: metric.timestamp
      });
    }

    // Throughput alert
    if (metric.throughput < this.thresholds.throughput) {
      this.addAlert({
        type: 'throughput',
        severity: 'warning',
        message: `Throughput is ${metric.throughput} req/min (threshold: ${this.thresholds.throughput} req/min)`,
        threshold: this.thresholds.throughput,
        actual: metric.throughput,
        timestamp: metric.timestamp
      });
    }

    // Error rate alert
    if (metric.errorRate > this.thresholds.errorRate) {
      this.addAlert({
        type: 'error_rate',
        severity: metric.errorRate > this.thresholds.errorRate * 2 ? 'critical' : 'error',
        message: `Error rate is ${metric.errorRate}% (threshold: ${this.thresholds.errorRate}%)`,
        threshold: this.thresholds.errorRate,
        actual: metric.errorRate,
        timestamp: metric.timestamp
      });
    }

    // Memory usage alert
    if (metric.memoryUsage > this.thresholds.memoryUsage) {
      this.addAlert({
        type: 'memory',
        severity: metric.memoryUsage > 95 ? 'critical' : 'warning',
        message: `Memory usage is ${metric.memoryUsage}% (threshold: ${this.thresholds.memoryUsage}%)`,
        threshold: this.thresholds.memoryUsage,
        actual: metric.memoryUsage,
        timestamp: metric.timestamp
      });
    }

    // CPU usage alert
    if (metric.cpuUsage > this.thresholds.cpuUsage) {
      this.addAlert({
        type: 'cpu',
        severity: metric.cpuUsage > 95 ? 'critical' : 'warning',
        message: `CPU usage is ${metric.cpuUsage}% (threshold: ${this.thresholds.cpuUsage}%)`,
        threshold: this.thresholds.cpuUsage,
        actual: metric.cpuUsage,
        timestamp: metric.timestamp
      });
    }
  }

  private addAlert(alert: PerformanceAlert) {
    this.alerts.push(alert);
    
    // Keep only recent alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
  }

  getMetrics(timeRange: 'hour' | 'day' | 'week' = 'day'): PerformanceMetrics[] {
    const now = new Date();
    const cutoff = new Date(now.getTime() - this.getTimeRangeMs(timeRange));
    
    return this.metrics.filter(metric => 
      new Date(metric.timestamp) > cutoff
    );
  }

  getAlerts(timeRange: 'hour' | 'day' | 'week' = 'day'): PerformanceAlert[] {
    const now = new Date();
    const cutoff = new Date(now.getTime() - this.getTimeRangeMs(timeRange));
    
    return this.alerts.filter(alert => 
      new Date(alert.timestamp) > cutoff
    );
  }

  getPerformanceSummary(timeRange: 'hour' | 'day' | 'week' = 'day') {
    const metrics = this.getMetrics(timeRange);
    
    if (metrics.length === 0) {
      return {
        averageResponseTime: 0,
        averageThroughput: 0,
        averageErrorRate: 0,
        averageMemoryUsage: 0,
        averageCpuUsage: 0,
        totalRequests: 0,
        healthScore: 0
      };
    }

    const summary = {
      averageResponseTime: Math.round(metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length),
      averageThroughput: Math.round(metrics.reduce((sum, m) => sum + m.throughput, 0) / metrics.length),
      averageErrorRate: Math.round((metrics.reduce((sum, m) => sum + m.errorRate, 0) / metrics.length) * 100) / 100,
      averageMemoryUsage: Math.round(metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / metrics.length),
      averageCpuUsage: Math.round(metrics.reduce((sum, m) => sum + m.cpuUsage, 0) / metrics.length),
      totalRequests: metrics.length,
      healthScore: this.calculateHealthScore(metrics)
    };

    return summary;
  }

  private calculateHealthScore(metrics: PerformanceMetrics[]): number {
    let score = 100;

    // Deduct points for poor performance
    const avgResponseTime = metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length;
    const avgErrorRate = metrics.reduce((sum, m) => sum + m.errorRate, 0) / metrics.length;
    const avgMemoryUsage = metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / metrics.length;
    const avgCpuUsage = metrics.reduce((sum, m) => sum + m.cpuUsage, 0) / metrics.length;

    if (avgResponseTime > this.thresholds.responseTime) score -= 20;
    if (avgErrorRate > this.thresholds.errorRate) score -= 30;
    if (avgMemoryUsage > this.thresholds.memoryUsage) score -= 15;
    if (avgCpuUsage > this.thresholds.cpuUsage) score -= 15;

    return Math.max(0, Math.min(100, score));
  }

  private getTimeRangeMs(timeRange: 'hour' | 'day' | 'week'): number {
    switch (timeRange) {
      case 'hour': return 60 * 60 * 1000;
      case 'day': return 24 * 60 * 60 * 1000;
      case 'week': return 7 * 24 * 60 * 60 * 1000;
      default: return 24 * 60 * 60 * 1000;
    }
  }

  clearOldData() {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    this.metrics = this.metrics.filter(metric => 
      new Date(metric.timestamp) > oneWeekAgo
    );
    
    this.alerts = this.alerts.filter(alert => 
      new Date(alert.timestamp) > oneWeekAgo
    );
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Utility functions for easy metric recording
export function recordApiCall(responseTime: number, success: boolean) {
  performanceMonitor.recordMetric({
    responseTime,
    throughput: 1, // Will be calculated properly in production
    errorRate: success ? 0 : 100,
    memoryUsage: process.memoryUsage().heapUsed / process.memoryUsage().heapTotal * 100,
    cpuUsage: 0, // Would need proper CPU monitoring in production
  });
}

export function recordDatabaseQuery(responseTime: number, success: boolean) {
  performanceMonitor.recordMetric({
    responseTime,
    throughput: 1,
    errorRate: success ? 0 : 100,
    memoryUsage: process.memoryUsage().heapUsed / process.memoryUsage().heapTotal * 100,
    cpuUsage: 0,
  });
}

export function recordAIProcessing(responseTime: number, success: boolean) {
  performanceMonitor.recordMetric({
    responseTime,
    throughput: 1,
    errorRate: success ? 0 : 100,
    memoryUsage: process.memoryUsage().heapUsed / process.memoryUsage().heapTotal * 100,
    cpuUsage: 0,
  });
}
