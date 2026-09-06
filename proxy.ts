import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  if (!token) {
    const loginUrl = new URL("/auth", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role as "ADMIN" | "NAKES" | "PETUGAS" | undefined;

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  if (pathname.startsWith("/nakes") && role !== "NAKES") {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  if (pathname.startsWith("/petugas") && role !== "PETUGAS") {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/nakes/:path*", "/petugas/:path*"],
};