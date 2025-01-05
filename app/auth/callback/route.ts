"use server";

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { Database } from "@/app/types/supabase";
import { createServerClient } from "@/app/lib/supabase/server";

export async function GET(request: Request) {
    try {
        const requestUrl = new URL(request.url);
        const code = requestUrl.searchParams.get("code");

        if (!code) {
            return NextResponse.redirect(new URL("/auth/login", requestUrl.origin));
        }

        // Use RouteHandlerClient for session exchange
        const routeHandler = createRouteHandlerClient<Database>({
            cookies: () => cookies(),
        });

        // Exchange the code for a session
        const { error: sessionError } = await routeHandler.auth.exchangeCodeForSession(code);

        if (sessionError) {
            console.error("Session error:", sessionError);
            return NextResponse.redirect(new URL("/auth/login", requestUrl.origin));
        }

        // Use ServerClient for data operations
        const supabase = await createServerClient();

        // Get user after exchanging the code
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error("User error:", userError);
            return NextResponse.redirect(new URL("/auth/login", requestUrl.origin));
        }

        // Check if user has username
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", user.id)
            .single();

        if (profileError && profileError.code !== "PGRST116") {
            console.error("Profile error:", profileError);
            return NextResponse.redirect(new URL("/auth/login", requestUrl.origin));
        }

        // Redirect based on username existence
        const redirectUrl = !profile?.username
            ? new URL("/username", requestUrl.origin)
            : new URL("/recipes", requestUrl.origin);

        return NextResponse.redirect(redirectUrl);
    } catch (error) {
        console.error("Callback error:", error);
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }
}
