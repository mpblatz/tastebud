import { createServerClient } from "@/app/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { RecipeEditor } from "@/app/components/RecipeEditor";
import { revalidatePath } from "next/cache";
import { DatabaseRecipe } from "@/app/types";

export default async function EditRecipePage(props: { params: Promise<{ id: string }> }) {
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

    // Transform the data to match the DatabaseRecipe type
    const editorData: DatabaseRecipe = {
        id: recipe.id,
        title: recipe.title,
        prep_time_minutes: recipe.prep_time_minutes,
        cook_time_minutes: recipe.cook_time_minutes,
        servings: recipe.servings,
        main_image_url: recipe.main_image_url,
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

    async function handleDelete() {
        "use server";
        const supabase = await createServerClient();

        // Delete the recipe and all related data (cascade delete should handle components)
        const { error } = await supabase.from("recipes").delete().eq("id", id);

        if (error) {
            throw new Error("Failed to delete recipe");
        }

        revalidatePath("/recipes");
        redirect("/recipes");
    }

    return (
        <div className="mt-8">
            <RecipeEditor existingRecipe={editorData} recipeId={id} onDelete={handleDelete} />
        </div>
    );
}
