"use server";

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

// For server components and route handlers
export async function createServerClient() {
    return createServerComponentClient<Database>({
        cookies: () => cookies(),
    });
}
