import { createServerClient } from "@/lib/supabase/server";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import Link from "next/link";
import { PlusCircle, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatabaseRecipe } from "@/types";
import { Input } from "@/components/ui/input";

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
      main_image_url,
      created_at
    `
        )
        .order("created_at", { ascending: false });

    const recipeData: DatabaseRecipe[] =
        recipes?.map((recipe) => ({
            id: recipe.id,
            title: recipe.title,
            prep_time_minutes: recipe.prep_time_minutes,
            cook_time_minutes: recipe.cook_time_minutes,
            main_image_url: recipe.main_image_url,
            created_at: recipe.created_at,
            // Setting default values for optional properties
            servings: null,
            calories: null,
            protein_grams: null,
            fat_grams: null,
            carbs_grams: null,
            recipe_components: [], // Since recipe components aren't in the query, initialize as empty array
        })) || [];

    return (
        <div>
            <div className="flex justify-between items-center mb-8 space-x-4">
                <h1 className="text-3xl font-bold whitespace-nowrap">My Recipes</h1>
                <div className="relative w-full">
                    <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="text" placeholder="Search" className="w-full pl-8 pr-4" />
                </div>
                <Button asChild>
                    <Link href="/recipes/new" className="flex items-center gap-2">
                        <PlusCircle className="w-4 h-4" />
                        New Recipe
                    </Link>
                </Button>
            </div>

            {recipeData?.length === 0 ? (
                <div className="text-center py-20 space-y-2">
                    <p>You haven't created any recipes yet.</p>
                    <Button asChild variant="outline">
                        <Link href="/recipes/new">Create or Upload a Recipe</Link>
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col space-y-4">
                    {recipeData?.map((recipe) => (
                        <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                </div>
            )}
        </div>
    );
}
