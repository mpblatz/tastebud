import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Database } from "@/types/supabase";

export async function middleware(request: NextRequest) {
    // Public paths that don't need authentication
    const publicPaths = ["/login", "/callback"];
    if (publicPaths.includes(request.nextUrl.pathname)) {
        return NextResponse.next();
    }

    const supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value);
                        supabaseResponse.cookies.set(name, value, options);
                    });
                },
            },
        }
    );

    try {
        // IMPORTANT: This refreshes the session if needed
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();

        // Allow access to username page after authentication
        if (request.nextUrl.pathname === "/username") {
            if (!user) {
                return NextResponse.redirect(new URL("/login", request.url));
            }
            return supabaseResponse;
        }

        // Protect all other routes
        if (!user || error) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        return supabaseResponse;
    } catch (error) {
        console.error("Middleware error:", error);
        return NextResponse.redirect(new URL("/login", request.url));
    }
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
