export const getURL = () => {
  // 1. Favor window.location.origin on the client side
  if (typeof window !== 'undefined') {
    return window.location.origin.endsWith('/') 
      ? window.location.origin 
      : `${window.location.origin}/`
  }

  // 2. Server-side environment variables
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? 
    process?.env?.URL ?? // Netlify's primary URL
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? 
    'http://localhost:3000/'
  
  url = url.includes('http') ? url : `https://${url}`
  url = url.endsWith('/') ? url : `${url}/`
  return url
}
