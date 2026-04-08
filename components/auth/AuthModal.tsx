"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface AuthModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function AuthModal({ open, onOpenChange }: AuthModalProps) {
    const supabase = createClient();

    const handleLogin = async () => {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${location.origin}/callback?popup=true`,
                    skipBrowserRedirect: true,
                },
            });

            if (error) throw error;
            if (!data.url) return;

            const width = 500;
            const height = 600;
            const left = window.screenX + (window.outerWidth - width) / 2;
            const top = window.screenY + (window.outerHeight - height) / 2;

            window.open(
                data.url,
                "google-auth",
                `width=${width},height=${height},left=${left},top=${top}`
            );

            // Listen for auth state change from the popup
            const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
                if (event === "SIGNED_IN") {
                    subscription.unsubscribe();
                    onOpenChange(false);
                    window.location.reload();
                }
            });
        } catch (error) {
            console.error("Error logging in:", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader className="items-center">
                    <DialogTitle className="text-xl">tastebud</DialogTitle>
                    <DialogDescription>Sign in to access your recipes</DialogDescription>
                </DialogHeader>
                <div className="flex justify-center pt-2">
                    <Button onClick={handleLogin}>Login with Google</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
