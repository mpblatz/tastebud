import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit } from "lucide-react";

export default async function RecipePage({ params: { id } }: { params: { id: string } }) {
    const supabase = await createServerClient();

    const { data: recipe } = await supabase
        .from("recipes")
        .select(
            `
      *,
      recipe_components (
        *,
        component_ingredients (*),
        component_instructions (*)
      )
    `
        )
        .eq("id", id)
        .single();

    if (!recipe) {
        notFound();
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">{recipe.title}</h1>
                <Button asChild>
                    <Link href={`/recipes/${id}/edit`} className="flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Edit Recipe
                    </Link>
                </Button>
            </div>

            <div className="flex gap-4 text-sm text-gray-600 mb-8">
                {recipe.prep_time_minutes && <p>Prep Time: {recipe.prep_time_minutes} minutes</p>}
                {recipe.cook_time_minutes && <p>Cook Time: {recipe.cook_time_minutes} minutes</p>}
                {recipe.servings && <p>Servings: {recipe.servings}</p>}
            </div>

            {recipe.recipe_components.map((component) => (
                <div key={component.id} className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">{component.name}</h2>

                    <div className="mb-6">
                        <h3 className="text-lg font-medium mb-2">Ingredients</h3>
                        <ul className="list-disc pl-5 space-y-1">
                            {component.component_ingredients.map((item) => (
                                <li key={item.id}>{item.ingredient}</li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium mb-2">Instructions</h3>
                        <ol className="list-decimal pl-5 space-y-2">
                            {component.component_instructions.map((item) => (
                                <li key={item.id}>{item.instruction}</li>
                            ))}
                        </ol>
                    </div>
                </div>
            ))}
        </div>
    );
}
