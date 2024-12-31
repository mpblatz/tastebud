import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LoginButton from "@/app/components/auth/LoginButton";

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
            <div className="max-w-md space-y-8 px-4 flex flex-col">
                <div className="text-center">
                    <h1 className="text-4xl font-bold">tastebud</h1>
                    <p className="mt-2">Sign in to access your recipes</p>
                </div>
                <LoginButton />
            </div>
        </div>
    );
}
