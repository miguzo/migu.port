import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const host = req.headers.get("host");

  if (host === "migu-player.com" || host === "www.migu-player.com") {
    const url = req.nextUrl.clone();
    url.pathname = "/player";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
