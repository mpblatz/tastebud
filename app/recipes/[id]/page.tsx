// app/recipes/[id]/page.tsx
import { createServerClient } from "@/app/lib/supabase/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit } from "lucide-react";
import { RecipeView } from "@/app/components/RecipeView";

export default async function RecipePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;
    const supabase = await createServerClient();

    const { data: recipe } = await supabase
        .from("recipes")
        .select(
            `*,
            recipe_components (
                *,
                component_ingredients (*),
                component_instructions (*)
            )`
        )
        .eq("id", id)
        .single();

    if (!recipe) {
        notFound();
    }

    // Transform the database recipe into the format RecipeView expects
    const viewRecipe = {
        title: recipe.title,
        prepTimeMinutes: recipe.prep_time_minutes,
        cookTimeMinutes: recipe.cook_time_minutes,
        servings: recipe.servings,
        mainImageUrl: recipe.main_image_url,
        components: recipe.recipe_components.map((component) => ({
            id: component.id,
            name: component.name,
            ingredients: component.component_ingredients.map((i) => i.ingredient),
            instructions: component.component_instructions.map((i) => i.instruction),
        })),
    };

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-bold tracking-tight">{recipe.title}</h1>
                <Button asChild variant="outline">
                    <Link href={`/recipes/${id}/edit`} className="flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Edit Recipe
                    </Link>
                </Button>
            </div>

            <RecipeView recipe={viewRecipe} />
        </div>
    );
}
