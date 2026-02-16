import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Exclude static assets, auth routes, and admin panel from maintenance check
  const isExcluded = 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname.startsWith('/images') || 
    pathname.startsWith('/favicon.ico') || 
    pathname.startsWith('/auth') || 
    pathname.startsWith('/admin')

  if (isExcluded) {
    // SECURITY: Even if excluded from maintenance, /admin must be protected
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
    return NextResponse.next()
  }

  try {
    const supabase = await createClient()

    // 2. Check Maintenance Mode status
    const { data: settings } = await supabase
      .from('site_settings')
      .select('maintenance_mode')
      .eq('id', 'global')
      .single()

    if (settings?.maintenance_mode) {
      // 3. If maintenance is ON, check if user is an ADMIN
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        // If admin, let them pass
        if (profile?.role === 'admin') {
          return NextResponse.next()
        }
      }

      // 4. If not admin or not logged in, show maintenance page
      // We can redirect to a special route or rewrite to a maintenance view
      // For simplicity, let's redirect to a simple static maintenance page if it exists
      // or just return a simple response.
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Maintenance Mode | Virginia Liquidation</title>
            <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@900&family=Manrope:wght@400&display=swap" rel="stylesheet">
            <style>
                body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #0B2B53; color: white; font-family: 'Manrope', sans-serif; text-align: center; }
                .card { border: 4px solid #049A9E; padding: 3rem; max-width: 500px; background: white; color: #464646; box-shadow: 12px 12px 0px 0px #049A9E; }
                h1 { font-family: 'Urbanist', sans-serif; font-weight: 900; text-transform: uppercase; letter-spacing: -0.05em; color: #049A9E; font-size: 3rem; margin: 0 0 1rem 0; font-style: italic; }
                p { font-weight: 500; margin-bottom: 2rem; }
                .logo { height: 60px; margin-bottom: 2rem; }
            </style>
        </head>
        <body>
            <div class="card">
                <img src="/images/logo-virginia-transparent.png" class="logo" alt="Logo">
                <h1>Under Maintenance</h1>
                <p>We are currently updating our industrial catalog. Please check back later today.</p>
                <div style="font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; color: #DADADA;">Virginia Liquidation • Industrial Auctions</div>
            </div>
        </body>
        </html>
        `,
        { status: 503, headers: { 'content-type': 'text/html' } }
      )
    }
  } catch (error) {
    // If DB fails, we proceed normally to avoid blocking the site
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
