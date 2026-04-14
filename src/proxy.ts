import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // Public routes
  if (pathname === '/login') {
    if (user) return NextResponse.redirect(new URL('/', request.url));
    return supabaseResponse;
  }

  // All routes require auth
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role-based routing
  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  const isAdmin = profile?.role === 'ADMIN';

  // Admins going to user routes → send to admin dashboard
  if (isAdmin && (pathname === '/' || pathname.startsWith('/parsha') || pathname.startsWith('/aliyah'))) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // Non-admins trying to access admin routes → send home
  if (!isAdmin && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
