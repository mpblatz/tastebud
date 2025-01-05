import { redirect } from "next/navigation";
import { createServerClient } from "@/app/lib/supabase/server";

export default async function Home() {
    const supabase = await createServerClient();
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        redirect("/auth/login");
    }

    redirect("/recipes");
}
