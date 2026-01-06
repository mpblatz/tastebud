import { redirect } from "next/navigation";
import UsernameForm from "./username-form";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function UsernamePage() {
    try {
        // Create server component client
        const supabase = await createServerClient();

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            redirect("/login");
        }

        // Check if username already exists
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", user.id)
            .single();

        if (profileError && profileError.code !== "PGRST116") {
            console.error("Profile error:", profileError);
            redirect("/login");
        }

        if (profile?.username) {
            redirect("/recipes");
        }

        return <UsernameForm userId={user.id} />;
    } catch (error) {
        console.error("Username page error:", error);
        redirect("/login");
    }
}
