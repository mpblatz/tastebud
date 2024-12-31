// app/recipes/new/page.tsx
"use client";

import { RecipeData, RecipeEditor } from "@/app/components/RecipeEditor";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export default function NewRecipePage() {
    const router = useRouter();
    const supabase = createClientComponentClient();

    const handleSave = async (recipeData: RecipeData) => {
        try {
            const { data: recipe, error: recipeError } = await supabase
                .from("recipes")
                .insert({
                    title: recipeData.title,
                    prep_time_minutes: recipeData.prepTimeMinutes,
                    cook_time_minutes: recipeData.cookTimeMinutes,
                    servings: recipeData.servings,
                })
                .select()
                .single();

            if (recipeError) throw recipeError;

            // Insert components
            for (const component of recipeData.components) {
                const { error: componentError } = await supabase.from("recipe_components").insert({
                    recipe_id: recipe.id,
                    name: component.name,
                    order_index: recipeData.components.indexOf(component),
                });

                if (componentError) throw componentError;

                // Insert ingredients and instructions
                // ... similar insert operations for ingredients and instructions
            }

            router.push("/recipes");
        } catch (error) {
            console.error("Error saving recipe:", error);
            // Handle error appropriately
        }
    };

    return (
        <div className="container mx-auto py-8">
            <RecipeEditor onSave={handleSave} />
        </div>
    );
}
