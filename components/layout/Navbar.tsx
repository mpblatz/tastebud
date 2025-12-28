"use client";

import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useTheme } from "next-themes";
import { Moon, Sun, Laptop } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuRadioGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";

export function Navbar({ username }: { user: User; username?: string }) {
    const supabase = createClientComponentClient();
    const { theme, setTheme } = useTheme();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = "/login";
    };

    // Get the first letter of the username for the avatar fallback
    const userInitial = username ? username[0].toUpperCase() : "U";

    return (
        <nav className="border-b">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between w-[800px]">
                <Link href="/recipes" className="text-xl font-bold">
                    tastebud
                </Link>

                <DropdownMenu>
                    <DropdownMenuTrigger className="focus:outline-none">
                        <div className="flex items-center gap-2">
                            <span className="text-sm">welcome, {username}</span>
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="/avatar.webp" alt="@shadcn" />
                                <AvatarFallback className="bg-indigo-100 text-indigo-600">{userInitial}</AvatarFallback>
                            </Avatar>
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                            <DropdownMenuItem className="flex items-center gap-2" onClick={() => setTheme("light")}>
                                <Sun className="h-4 w-4" />
                                <span>Light</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2" onClick={() => setTheme("dark")}>
                                <Moon className="h-4 w-4" />
                                <span>Dark</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2" onClick={() => setTheme("system")}>
                                <Laptop className="h-4 w-4" />
                                <span>System</span>
                            </DropdownMenuItem>
                        </DropdownMenuRadioGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </nav>
    );
}
