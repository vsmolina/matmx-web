/**
 * Performance monitoring utilities for the MatMX ERP frontend
 */

interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: number
}

interface PageLoadMetrics {
  navigationStart: number
  domContentLoaded: number
  loadComplete: number
  firstContentfulPaint?: number
  largestContentfulPaint?: number
  firstInputDelay?: number
  cumulativeLayoutShift?: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private isClient = typeof window !== 'undefined'

  /**
   * Record a custom performance metric
   */
  recordMetric(name: string, value: number, unit: string = 'ms') {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now()
    }
    
    this.metrics.push(metric)
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 Performance: ${name} = ${value}${unit}`)
    }
  }

  /**
   * Measure function execution time
   */
  async measureFunction<T>(
    name: string,
    fn: () => Promise<T> | T
  ): Promise<T> {
    const start = performance.now()
    
    try {
      const result = await fn()
      const duration = performance.now() - start
      this.recordMetric(name, Math.round(duration))
      return result
    } catch (error) {
      const duration = performance.now() - start
      this.recordMetric(`${name}_error`, Math.round(duration))
      throw error
    }
  }

  /**
   * Measure API call performance
   */
  async measureApiCall<T>(
    endpoint: string,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    return this.measureFunction(`api_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`, fetchFn)
  }

  /**
   * Get Core Web Vitals metrics
   */
  getCoreWebVitals(): Promise<PageLoadMetrics> {
    return new Promise((resolve) => {
      if (!this.isClient) {
        resolve({
          navigationStart: 0,
          domContentLoaded: 0,
          loadComplete: 0
        })
        return
      }

      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const paint = performance.getEntriesByType('paint')
      
      const metrics: PageLoadMetrics = {
        navigationStart: navigation.navigationStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        loadComplete: navigation.loadEventEnd - navigation.navigationStart,
      }

      // First Contentful Paint
      const fcp = paint.find(entry => entry.name === 'first-contentful-paint')
      if (fcp) {
        metrics.firstContentfulPaint = fcp.startTime
      }

      // Largest Contentful Paint
      if ('PerformanceObserver' in window) {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          metrics.largestContentfulPaint = lastEntry.startTime
        }).observe({ entryTypes: ['largest-contentful-paint'] })

        // First Input Delay
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach(entry => {
            if (entry.processingStart && entry.startTime) {
              metrics.firstInputDelay = entry.processingStart - entry.startTime
            }
          })
        }).observe({ entryTypes: ['first-input'] })

        // Cumulative Layout Shift
        new PerformanceObserver((list) => {
          let clsValue = 0
          list.getEntries().forEach(entry => {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value
            }
          })
          metrics.cumulativeLayoutShift = clsValue
        }).observe({ entryTypes: ['layout-shift'] })
      }

      // Return current metrics immediately, updates will happen async
      resolve(metrics)
    })
  }

  /**
   * Monitor component render performance
   */
  startComponentMeasure(componentName: string): () => void {
    const start = performance.now()
    
    return () => {
      const duration = performance.now() - start
      this.recordMetric(`component_render_${componentName}`, Math.round(duration))
    }
  }

  /**
   * Monitor route transitions
   */
  measureRouteTransition(from: string, to: string): () => void {
    const start = performance.now()
    
    return () => {
      const duration = performance.now() - start
      this.recordMetric(`route_transition_${from}_to_${to}`, Math.round(duration))
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  /**
   * Get metrics summary
   */
  getMetricsSummary(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const summary: Record<string, { avg: number; min: number; max: number; count: number }> = {}
    
    this.metrics.forEach(metric => {
      if (!summary[metric.name]) {
        summary[metric.name] = {
          avg: 0,
          min: metric.value,
          max: metric.value,
          count: 0
        }
      }
      
      const s = summary[metric.name]
      s.count++
      s.min = Math.min(s.min, metric.value)
      s.max = Math.max(s.max, metric.value)
      s.avg = ((s.avg * (s.count - 1)) + metric.value) / s.count
    })
    
    return summary
  }

  /**
   * Export metrics as JSON
   */
  exportMetrics(): string {
    const data = {
      timestamp: new Date().toISOString(),
      url: this.isClient ? window.location.href : 'unknown',
      userAgent: this.isClient ? navigator.userAgent : 'unknown',
      metrics: this.getMetrics(),
      summary: this.getMetricsSummary()
    }
    
    return JSON.stringify(data, null, 2)
  }

  /**
   * Clear all recorded metrics
   */
  clearMetrics(): void {
    this.metrics = []
  }

  /**
   * Monitor bundle size impact
   */
  measureBundleImpact(): void {
    if (!this.isClient || !('performance' in window)) return

    // Monitor resource loading
    window.addEventListener('load', () => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      
      let totalSize = 0
      let jsSize = 0
      let cssSize = 0
      
      resources.forEach(resource => {
        if (resource.transferSize) {
          totalSize += resource.transferSize
          
          if (resource.name.includes('.js')) {
            jsSize += resource.transferSize
          } else if (resource.name.includes('.css')) {
            cssSize += resource.transferSize
          }
        }
      })
      
      this.recordMetric('bundle_size_total', Math.round(totalSize / 1024), 'KB')
      this.recordMetric('bundle_size_js', Math.round(jsSize / 1024), 'KB')
      this.recordMetric('bundle_size_css', Math.round(cssSize / 1024), 'KB')
    })
  }

  /**
   * Monitor memory usage
   */
  measureMemoryUsage(): void {
    if (!this.isClient || !('memory' in performance)) return

    const memory = (performance as any).memory
    if (memory) {
      this.recordMetric('memory_used', Math.round(memory.usedJSHeapSize / 1024 / 1024), 'MB')
      this.recordMetric('memory_total', Math.round(memory.totalJSHeapSize / 1024 / 1024), 'MB')
      this.recordMetric('memory_limit', Math.round(memory.jsHeapSizeLimit / 1024 / 1024), 'MB')
    }
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor()

// React hook for component performance monitoring
export function usePerformanceMonitor(componentName: string) {
  const measureRender = () => performanceMonitor.startComponentMeasure(componentName)
  const measureFunction = (name: string, fn: () => any) => 
    performanceMonitor.measureFunction(`${componentName}_${name}`, fn)
  
  return {
    measureRender,
    measureFunction,
    recordMetric: (name: string, value: number, unit?: string) => 
      performanceMonitor.recordMetric(`${componentName}_${name}`, value, unit)
  }
}

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  // Start monitoring bundle and memory
  performanceMonitor.measureBundleImpact()
  
  // Monitor memory usage every 30 seconds
  setInterval(() => {
    performanceMonitor.measureMemoryUsage()
  }, 30000)
  
  // Export metrics to console in development
  if (process.env.NODE_ENV === 'development') {
    (window as any).exportPerformanceMetrics = () => {
      console.log('Performance Metrics:', performanceMonitor.exportMetrics())
    }
  }
}

export default performanceMonitor