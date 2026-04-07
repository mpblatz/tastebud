import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LoginButton from "@/components/auth/LoginButton";

export default async function LoginPage() {
    const supabase = await createServerClient();
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (session) {
        redirect("/recipes");
    }

    return (
        <div className="flex min-h-[80vh] items-center justify-center">
            <div className="max-w-md space-y-8 px-4 flex flex-col items-center">
                <div className="text-center space-y-2">
                    <h1 className="font-bold">tastebud</h1>
                    <p className="text-[13px] text-text-muted">Sign in to access your recipes</p>
                </div>
                <LoginButton />
            </div>
        </div>
    );
}
