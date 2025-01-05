import { createServerClient } from "@/app/lib/supabase/server";
import { RecipeCard } from "@/app/components/RecipeCard";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function RecipesPage() {
    const supabase = await createServerClient();

    const { data: recipes } = await supabase
        .from("recipes")
        .select(
            `
      id,
      title,
      prep_time_minutes,
      cook_time_minutes,
      created_at
    `
        )
        .order("created_at", { ascending: false });

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">My Recipes</h1>
                <Button asChild>
                    <Link href="/recipes/new" className="flex items-center gap-2">
                        <PlusCircle className="w-4 h-4" />
                        New Recipe
                    </Link>
                </Button>
            </div>

            {recipes?.length === 0 ? (
                <div className="text-center py-20 space-y-2">
                    <p>You haven't created any recipes yet.</p>
                    <Button asChild variant="outline">
                        <Link href="/recipes/new">Create or Upload a Recipe</Link>
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col space-y-4">
                    {recipes?.map((recipe) => (
                        <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                </div>
            )}
        </div>
    );
}
