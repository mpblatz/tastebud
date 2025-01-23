import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit } from "lucide-react";
import { RecipeView } from "@/components/recipes/RecipeView";
import { DatabaseRecipe } from "@/types";

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
            ),
            recipes_tags (
                *,
                tag: tags (*)
            )`
        )
        .eq("id", id)
        .single();

    if (!recipe) {
        notFound();
    }

    const databaseRecipe: DatabaseRecipe = {
        id: recipe.id,
        title: recipe.title,
        prep_time_minutes: recipe.prep_time_minutes,
        cook_time_minutes: recipe.cook_time_minutes,
        servings: recipe.servings,
        main_image_url: recipe.main_image_url,
        calories: recipe.calories,
        protein_grams: recipe.protein_grams,
        carbs_grams: recipe.carbs_grams,
        fat_grams: recipe.fat_grams,
        recipe_components: recipe.recipe_components.map((component) => ({
            id: component.id,
            name: component.name,
            component_ingredients: component.component_ingredients.map((i) => ({
                id: i.id,
                ingredient: i.ingredient,
            })),
            component_instructions: component.component_instructions.map((i) => ({
                id: i.id,
                instruction: i.instruction,
            })),
        })),
        recipes_tags:
            recipe.recipes_tags?.map((rt) => ({
                recipe_id: rt.recipe_id,
                tag_id: rt.tag_id!,
                tag: rt.tag!,
            })) || [],
        created_at: recipe.created_at,
        import_url: recipe.import_url,
    };

    // Function to transform DatabaseRecipe to RecipeData for RecipeView
    const transformToRecipeData = (dbRecipe: DatabaseRecipe) => ({
        title: dbRecipe.title,
        prepTimeMinutes: dbRecipe.prep_time_minutes,
        cookTimeMinutes: dbRecipe.cook_time_minutes,
        servings: dbRecipe.servings,
        mainImageUrl: dbRecipe.main_image_url,
        calories: dbRecipe.calories,
        proteinGrams: dbRecipe.protein_grams,
        carbsGrams: dbRecipe.carbs_grams,
        fatGrams: dbRecipe.fat_grams,
        components: dbRecipe.recipe_components.map((component) => ({
            id: component.id,
            name: component.name,
            ingredients: component.component_ingredients.map((i) => i.ingredient),
            instructions: component.component_instructions.map((i) => i.instruction),
            orderIndex: 0, // You might want to add order_index to your DatabaseRecipe type if needed
        })),
        tags: dbRecipe.recipes_tags?.map((rt) => rt.tag) || [],
        import_url: dbRecipe.import_url,
    });

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <div className="flex justify-between items-start mb-6 space-x-4">
                <h1 className="text-4xl font-bold tracking-tight">{databaseRecipe.title}</h1>
                <Button asChild variant="outline">
                    <Link href={`/recipes/${id}/edit`} className="flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Edit Recipe
                    </Link>
                </Button>
            </div>

            <RecipeView recipe={transformToRecipeData(databaseRecipe)} />
        </div>
    );
}
