// app/username/username-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/app/types/supabase";

export default function UsernameForm({ userId }: { userId: string }) {
    const [username, setUsername] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClientComponentClient<Database>();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Check for existing username
            const { data: existingUser, error: checkError } = await supabase
                .from("profiles")
                .select("username")
                .eq("username", username.toLowerCase())
                .single();

            if (checkError && checkError.code !== "PGRST116") {
                throw checkError;
            }

            if (existingUser) {
                setError("This username is already taken");
                setLoading(false);
                return;
            }

            // Update profile with new username
            const { data: updateData, error: updateError } = await supabase.from("profiles").upsert(
                {
                    id: userId, // Use passed userId instead of fetching user again
                    username: username.toLowerCase(),
                    updated_at: new Date().toISOString(),
                },
                {
                    onConflict: "id",
                }
            );

            if (updateError) {
                throw updateError;
            }

            router.push("/recipes");
            router.refresh();
        } catch (err) {
            console.error("Error details:", {
                error: err,
                userId: userId,
                username: username,
            });
            setError(err instanceof Error ? err.message : "Failed to set username");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h1 className="mt-6 text-center text-3xl font-bold tracking-tight">Choose your username</h1>
                    <p className="mt-2 text-center text-sm">Pick something unique that will identify you</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="username" className="sr-only">
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="relative pl-2 block w-full rounded-md border-0 py-1.5 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                placeholder="Username"
                                pattern="[a-zA-Z0-9_\-]{2,15}"
                                title="Username must be 2-15 characters long and can only contain letters, numbers, underscores, and hyphens"
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value);
                                    setError(null);
                                }}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-red-800">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Setting username..." : "Continue"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
