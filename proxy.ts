import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function proxy(request: NextRequest) {
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

      // 4. Realtime SaaS Premium Maintenance Page
      const response = new NextResponse(
        `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>System Update | Virginia Liquidation</title>
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
            <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
            <style>
                :root { --primary: #049A9E; --secondary: #0B2B53; --bg: #F9FAFB; }
                body { 
                    margin: 0; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    min-height: 100vh; 
                    background: var(--bg); 
                    color: var(--secondary); 
                    font-family: 'Plus Jakarta Sans', sans-serif; 
                    text-align: center; 
                    padding: 24px;
                }
                .card { 
                    background: white; 
                    padding: 60px; 
                    max-width: 500px; 
                    width: 100%;
                    border-radius: 48px; 
                    box-shadow: 0 30px 60px rgba(11, 43, 83, 0.05);
                    border: 1px solid rgba(11, 43, 83, 0.05);
                    position: relative;
                    overflow: hidden;
                }
                .logo { height: 40px; margin-bottom: 40px; opacity: 0.9; }
                .badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(4, 154, 158, 0.1);
                    color: var(--primary);
                    padding: 6px 16px;
                    border-radius: 100px;
                    font-size: 10px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.2em;
                    margin-bottom: 24px;
                }
                .pulse { width: 6px; height: 6px; background: var(--primary); border-radius: 50%; animation: pulse 2s infinite; }
                @keyframes pulse { 0% { transform: scale(0.95); opacity: 0.5; } 70% { transform: scale(1.5); opacity: 0; } 100% { transform: scale(0.95); opacity: 0; } }
                h1 { 
                    font-size: 42px; 
                    font-weight: 800; 
                    text-transform: uppercase; 
                    letter-spacing: -0.04em; 
                    line-height: 0.9;
                    margin: 0 0 24px 0; 
                    font-style: italic; 
                }
                p { font-size: 16px; color: #94A3B8; font-weight: 500; line-height: 1.6; margin-bottom: 40px; }
                .footer { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3em; color: #CBD5E1; }
                .bg-glow {
                    position: absolute;
                    bottom: -50px;
                    right: -50px;
                    width: 200px;
                    height: 200px;
                    background: var(--primary);
                    filter: blur(80px);
                    opacity: 0.05;
                    border-radius: 50%;
                }
            </style>
        </head>
        <body>
            <div class="card">
                <div class="bg-glow"></div>
                <img src="/images/logo-virginia-transparent.png" class="logo" alt="Logo">
                <br/>
                <div class="badge">
                    <span class="pulse"></span>
                    System Protocol Active
                </div>
                <h1>Catalogue <span style="color: var(--primary)">Sync</span> in Progress.</h1>
                <p>We are currently synchronizing our industrial inventory. Our bidding gateway will resume operations shortly.</p>
                <div class="footer">Virginia Liquidation • Industrial Governance</div>
            </div>

            <script>
                // Realtime synchronization to auto-reload when maintenance ends
                const SUPABASE_URL = "${process.env.NEXT_PUBLIC_SUPABASE_URL}";
                const SUPABASE_ANON_KEY = "${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}";
                
                if (SUPABASE_URL && SUPABASE_ANON_KEY) {
                    console.log('🔌 Connecting to Maintenance Realtime Protocol...');
                    const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                    client
                        .channel('public:site_settings')
                        .on('postgres_changes', { 
                            event: 'UPDATE', 
                            schema: 'public', 
                            table: 'site_settings', 
                            filter: 'id=eq.global' 
                        }, payload => {
                            console.log('🔄 Maintenance status update received:', payload.new.maintenance_mode);
                            if (payload.new && payload.new.maintenance_mode === false) {
                                console.log('✅ Maintenance ended. Reloading...');
                                window.location.reload();
                            }
                        })
                        .subscribe((status) => {
                            if (status === 'SUBSCRIBED') {
                                console.log('✅ Connected to Maintenance Channel');
                            }
                        });
                } else {
                    console.error('❌ Supabase keys missing for maintenance mode realtime');
                }
            </script>
        </body>
        </html>
        `,
        { status: 503, headers: { 'content-type': 'text/html' } }
      )
      
      // Prevent caching of the maintenance page
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      
      return response;
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
