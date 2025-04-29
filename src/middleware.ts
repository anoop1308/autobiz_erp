import { betterFetch } from "@better-fetch/fetch";
import type { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

type Session = typeof auth.$Infer.Session;

const isApiAuthRoute = createRouteMatcher(["/api/auth"])
const isPublicRoute = createRouteMatcher(["/login", "/signup"])

export async function middleware(request: NextRequest) {
	const { data: session } = await betterFetch<Session>("/api/auth/get-session", {
		baseURL: request.nextUrl.origin,
		headers: {
			cookie: request.headers.get("cookie") || "", // Forward the cookies from the request
		},
	}).catch(err => {
		console.error(err)
		return { data: null }
	})

	if(isPublicRoute(request)) {
		console.log("isPublicRoute", session)
		if(session){
			return NextResponse.redirect(new URL("/dashboard", request.url));
		}
		return NextResponse.next();
	}

	if(isApiAuthRoute(request)) {
		return NextResponse.next();
	}

	if (!session) {
		return NextResponse.redirect(new URL("/login", request.url));
	}
	return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};


export function createRouteMatcher(paths: string[]) {
	return (request: Request) => {
		return paths.some(p => request.url.includes(p))
	}
}
