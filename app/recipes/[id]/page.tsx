import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Edit, ExternalLink } from "lucide-react";
import { RecipeView } from "@/components/recipes/RecipeView";
import { DatabaseRecipe } from "@/types";
import { trimUrl } from "@/lib/recipe-scraper/utils";

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
        <div>
            <div className="flex justify-between items-start mb-8 gap-4">
                <div className="min-w-0">
                    <h1 className="font-bold">{databaseRecipe.title}</h1>
                    {databaseRecipe.import_url && (
                        <Link
                            href={databaseRecipe.import_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-1 text-[12px] font-mono text-[rgb(var(--link-color))] underline underline-offset-[3px] decoration-[rgb(var(--link-color))/30] hover:text-[rgb(var(--link-hover))] transition-colors duration-200"
                        >
                            {trimUrl(databaseRecipe.import_url)}
                            <ExternalLink className="w-3 h-3" />
                        </Link>
                    )}
                </div>
                <Link
                    href={`/recipes/${id}/edit`}
                    className="inline-flex items-center gap-2 no-underline shrink-0 font-mono text-[11px] tracking-[0.02em] rounded-md px-4 py-2 text-text-muted border border-[var(--border)] hover:text-foreground hover:border-[var(--border-hover)] transition-all duration-200"
                >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                </Link>
            </div>

            <RecipeView recipe={transformToRecipeData(databaseRecipe)} />
        </div>
    );
}
