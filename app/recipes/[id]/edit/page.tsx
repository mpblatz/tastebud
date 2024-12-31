import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { DatabaseRecipe, RecipeEditor } from "@/app/components/RecipeEditor";

export default async function EditRecipePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;

    const {
        id
    } = params;

    const supabase = await createServerClient();

    const { data: recipe } = await supabase
        .from("recipes")
        .select(
            `
            id,
            title,
            prep_time_minutes,
            cook_time_minutes,
            servings,
            recipe_components (
                id,
                name,
                component_ingredients (
                    id,
                    ingredient
                ),
                component_instructions (
                    id,
                    instruction
                )
            )
        `
        )
        .eq("id", id)
        .single();

    if (!recipe) {
        notFound();
    }

    // Transform the data to match the DatabaseRecipe type
    const editorData: DatabaseRecipe = {
        id: recipe.id,
        title: recipe.title,
        prep_time_minutes: recipe.prep_time_minutes,
        cook_time_minutes: recipe.cook_time_minutes,
        servings: recipe.servings,
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
    };

    return (
        <div>
            <RecipeEditor
                existingRecipe={editorData}
                recipeId={id}
                onSave={async (data) => {
                    // Handle save
                    console.log(data);
                }}
            />
        </div>
    );
}
