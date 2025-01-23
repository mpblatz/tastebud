import { createServerClient } from "@/lib/supabase/server";
import FilteredRecipes from "@/components/recipes/FilteredRecipes";
import { DatabaseRecipe } from "@/types";

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
                created_at,
                recipes_tags (
                    recipe_id,
                    tag_id,
                    tag: tags (*)
                ),
                import_url
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
            servings: null,
            calories: null,
            protein_grams: null,
            fat_grams: null,
            carbs_grams: null,
            recipe_components: [],
            recipes_tags:
                recipe.recipes_tags?.map((rt) => ({
                    recipe_id: rt.recipe_id,
                    tag_id: rt.tag_id!,
                    tag: rt.tag!,
                })) || [],
            import_url: recipe.import_url,
        })) || [];

    return (
        <div className="container mx-auto px-4">
            <FilteredRecipes initialRecipes={recipeData} />
        </div>
    );
}
