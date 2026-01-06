"use server";

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { Profile } from "@/types";

export async function GET(request: Request) {
    try {
        const requestUrl = new URL(request.url);
        const code = requestUrl.searchParams.get("code");

        if (!code) {
            return NextResponse.redirect(new URL("/login", requestUrl.origin));
        }

        const supabase = await createServerClient();

        // Exchange the code for a session
        const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

        if (sessionError) {
            console.error("Session error:", sessionError);
            return NextResponse.redirect(new URL("/login", requestUrl.origin));
        }

        // Get authenticated user
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error("User error:", userError);
            return NextResponse.redirect(new URL("/login", requestUrl.origin));
        }

        // Check if user has username
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", user.id)
            .single<Profile>();

        if (profileError && profileError.code !== "PGRST116") {
            console.error("Profile error:", profileError);
            return NextResponse.redirect(new URL("/login", requestUrl.origin));
        }

        // Redirect based on username existence
        const redirectUrl = profile?.username
            ? new URL("/recipes", requestUrl.origin)
            : new URL("/username", requestUrl.origin);

        return NextResponse.redirect(redirectUrl);
    } catch (error) {
        console.error("Callback error:", error);
        return NextResponse.redirect(new URL("/login", request.url));
    }
}
