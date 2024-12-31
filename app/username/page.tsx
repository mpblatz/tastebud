import { redirect } from "next/navigation";
import type { Database } from "@/types/supabase";
import UsernameForm from "./username-form";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function UsernamePage() {
    try {
        const cookieStore = cookies();
        const supabase = createServerComponentClient<Database>({
            cookies: () => cookieStore,
        });

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            redirect("/auth/login");
        }

        // Rest of your code remains the same
    } catch (error) {
        console.error("Username page error:", error);
        redirect("/auth/login");
    }
}
