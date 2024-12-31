import { createServerClient } from "@/lib/supabase/server";
import { RecipeCard } from "@/app/components/RecipeCard";
import Link from "next/link";
import { PlusCircle, Download } from "lucide-react";
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
                <div className="flex gap-4">
                    <Button asChild>
                        <Link href="/recipes/import" className="flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Import Recipe
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/recipes/new" className="flex items-center gap-2">
                            <PlusCircle className="w-4 h-4" />
                            New Recipe
                        </Link>
                    </Button>
                </div>
            </div>

            {recipes?.length === 0 ? (
                <div className="text-center py-20">
                    <p>You haven't created any recipes yet.</p>
                    <div className="flex gap-4 justify-center mt-4">
                        <Button asChild variant="outline">
                            <Link href="/recipes/import">Import a Recipe</Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/recipes/new">Create a Recipe</Link>
                        </Button>
                    </div>
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
