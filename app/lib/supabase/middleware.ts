import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Database } from "@/app/types/supabase";

export async function middleware(request: NextRequest) {
    // Public paths that don't need authentication
    const publicPaths = ["/auth/login", "/auth/callback"];
    if (publicPaths.includes(request.nextUrl.pathname)) {
        return NextResponse.next();
    }

    const res = NextResponse.next();
    // Create the middleware client with just the required parameters
    const supabase = createMiddlewareClient<Database>({
        req: request,
        res,
    });

    try {
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();

        // Allow access to username page after authentication
        if (request.nextUrl.pathname === "/username") {
            if (!user) {
                return NextResponse.redirect(new URL("/auth/login", request.url));
            }
            return res;
        }

        // Protect all other routes
        if (!user || error) {
            return NextResponse.redirect(new URL("/auth/login", request.url));
        }

        return res;
    } catch (error) {
        console.error("Middleware error:", error);
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
