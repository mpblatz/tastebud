"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { useTheme } from "next-themes";
import { Moon, Sun, Laptop } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { createClient } from "@/lib/supabase/client";

export function Navbar({ username }: { user: User; username?: string }) {
    const supabase = createClient();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = "/login";
    };

    const userInitial = username ? username[0].toUpperCase() : "U";
    const isActive = (t: string) => mounted && theme === t;

    return (
        <nav className="border-b border-[var(--divider)]">
            <div className="mx-auto max-w-[1100px] px-8 max-md:px-4 h-16 flex items-center justify-between">
                <Link href="/recipes" className="font-heading text-xl font-bold tracking-[-0.03em] text-foreground no-underline hover:text-foreground">
                    tastebud
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
                        <button
                            onClick={() => setTheme("system")}
                            className={`flex items-center justify-center w-[30px] h-[26px] rounded-[6px] transition-all duration-150 ${
                                isActive("system") ? "shadow-toggle" : ""
                            }`}
                            style={isActive("system") ? { background: "var(--toggle-active)" } : {}}
                            aria-label="System mode"
                        >
                            <Laptop className="h-3.5 w-3.5 text-text-muted" />
                        </button>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger className="focus:outline-none">
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-mono text-text-faint tracking-[0.02em]">{username}</span>
                                <Avatar className="h-7 w-7">
                                    <AvatarImage src="/avatar.webp" alt={username} />
                                    <AvatarFallback className="bg-[var(--btn-bg)] text-text-muted font-mono text-[10px] border border-[var(--border)]">{userInitial}</AvatarFallback>
                                </Avatar>
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem className="cursor-pointer font-mono text-xs" onClick={handleSignOut}>
                                Sign out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </nav>
    );
}
