"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

export async function createActionClient() {
    return createServerActionClient<Database>({ cookies });
}
