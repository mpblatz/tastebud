"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import AuthModal from "@/components/auth/AuthModal";

export function Navbar({ user, username }: { user?: User; username?: string }) {
    const supabase = createClient();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [authModalOpen, setAuthModalOpen] = useState(false);

    useEffect(() => setMounted(true), []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
    };

    const isActive = (t: string) => mounted && theme === t;

    return (
        <nav>
            <div className="flex items-center justify-between pb-4">
                <Link
                    href="/recipes"
                    className="font-heading text-[28px] font-bold tracking-[-0.03em] text-foreground no-underline hover:text-foreground"
                >
                    Tastebud
                </Link>

                <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-md p-[3px]" style={{ background: "var(--toggle-bg)" }}>
                        <button
                            onClick={() => setTheme("light")}
                            className={`flex items-center justify-center w-[30px] h-[26px] rounded-[6px] transition-all duration-150 ${
                                isActive("light") ? "shadow-toggle" : ""
                            }`}
                            style={isActive("light") ? { background: "var(--toggle-active)" } : {}}
                            aria-label="Light mode"
                        >
                            <Sun className="h-3.5 w-3.5 text-text-muted" />
                        </button>
                        <button
                            onClick={() => setTheme("dark")}
                            className={`flex items-center justify-center w-[30px] h-[26px] rounded-[6px] transition-all duration-150 ${
                                isActive("dark") ? "shadow-toggle" : ""
                            }`}
                            style={isActive("dark") ? { background: "var(--toggle-active)" } : {}}
                            aria-label="Dark mode"
                        >
                            <Moon className="h-3.5 w-3.5 text-text-muted" />
                        </button>
                    </div>

                    {user ? (
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono text-text-faint tracking-[0.02em]">{username}</span>
                            <Button size="sm" onClick={handleSignOut}>
                                Sign out
                            </Button>
                        </div>
                    ) : (
                        <Button size="sm" onClick={() => setAuthModalOpen(true)}>
                            Sign In
                        </Button>
                    )}

                    <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
                </div>
            </div>
        </nav>
    );
}
