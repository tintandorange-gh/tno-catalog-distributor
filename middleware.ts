import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Check if the request is for admin routes (except login)
  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.startsWith("/admin/login") &&
    request.nextUrl.pathname !== "/admin"
  ) {
    // Check for admin authentication cookie
    const adminAuth = request.cookies.get("admin-auth")

    if (!adminAuth || adminAuth.value !== "true") {
      // Redirect to admin login if not authenticated
      return NextResponse.redirect(new URL("/admin", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
