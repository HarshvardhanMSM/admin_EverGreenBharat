import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/nursery-master-catalog",
  "/nursery-vendors",
  "/nursery-orders",
  "/nursery-inquiries",
  "/green-army",
  "/nursery-templates",
  "/user-management",
  "/content",
  "/administration",
  "/settings",
];

const PUBLIC_ROUTES = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Retrieve token cookie (prepared for future server-side edge token validation)
  const token = request.cookies.get("admin_access_token")?.value;

  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route);

  // Future production logic: Validate JWT signature & expiration at Edge
  if (isProtectedRoute && !token) {
    // Future cookie-based redirect:
    // return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isPublicRoute && token) {
    // Future cookie-based redirect:
    // return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
