import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const host = req.headers.get("host");

  // If the request comes from migu-player.com
  if (host === "migu-player.com" || host === "www.migu-player.com") {
    const url = req.nextUrl.clone();
    url.pathname = "/player";   // Load /player for this domain
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}
