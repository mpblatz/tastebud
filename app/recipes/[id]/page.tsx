import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit } from "lucide-react";
import { RecipeView } from "@/components/recipes/RecipeView";
import { RecipeData } from "@/types";

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

    const recipeData: RecipeData = {
        title: recipe.title,
        prepTimeMinutes: recipe.prep_time_minutes,
        cookTimeMinutes: recipe.cook_time_minutes,
        servings: recipe.servings,
        mainImageUrl: recipe.main_image_url,
        calories: recipe.calories,
        proteinGrams: recipe.protein_grams,
        carbsGrams: recipe.carbs_grams,
        fatGrams: recipe.fat_grams,
        components: recipe.recipe_components.map((component) => ({
            id: component.id,
            name: component.name,
            ingredients: component.component_ingredients.map((i) => i.ingredient),
            instructions: component.component_instructions.map((i) => i.instruction),
            orderIndex: component.order_index,
        })),
    };

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <div className="flex justify-between items-start mb-6 space-x-4">
                <h1 className="text-4xl font-bold tracking-tight">{recipe.title}</h1>
                <Button asChild variant="outline">
                    <Link href={`/recipes/${id}/edit`} className="flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Edit Recipe
                    </Link>
                </Button>
            </div>

            <RecipeView recipe={recipeData} />
        </div>
    );
}
