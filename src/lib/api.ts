// API base URL utility
export const getApiBaseUrl = (): string => {
  // In production, use the same origin as the frontend but port 4000
  if (typeof window !== 'undefined') {
    // Client-side - always use the same protocol as the frontend
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:'
    const hostname = window.location.hostname
    
    // Production domains - use same domain since nginx proxies /api
    if (hostname === 'app.matmx.com.mx') {
      return 'https://app.matmx.com.mx'
    }
    
    // Local development
    if (hostname === 'localhost') {
      return `${protocol}//localhost:4000`
    }
    if (hostname === '192.168.1.36') {
      return `${protocol}//192.168.1.36:4000`
    }
    // For production, use the same hostname but port 4000
    return `${protocol}//${hostname}:4000`
  } else {
    // Server-side (SSR)
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  }
}

// API fetch wrapper with automatic base URL
export const apiCall = async (endpoint: string, options?: RequestInit) => {
  const baseUrl = getApiBaseUrl()
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
  
  return fetch(url, {
    credentials: 'include',
    ...options,
  })
}