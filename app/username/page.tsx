import { redirect } from "next/navigation";
import type { Database } from "@/types/supabase";
import UsernameForm from "./username-form";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function UsernamePage() {
    try {
        // Create server component client
        const supabase = createServerComponentClient<Database>({ cookies });

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            redirect("/auth/login");
        }

        // Check if username already exists
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", user.id)
            .single();

        if (profileError && profileError.code !== "PGRST116") {
            console.error("Profile error:", profileError);
            redirect("/auth/login");
        }

        if (profile?.username) {
            redirect("/recipes");
        }

        return <UsernameForm userId={user.id} />;
    } catch (error) {
        console.error("Username page error:", error);
        redirect("/auth/login");
    }
}
