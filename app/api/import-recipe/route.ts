// app/api/import-recipe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { scrapeRecipe } from "@/lib/recipe-scraper";
import { DatabaseRecipe } from "@/types";

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        // Scrape the recipe
        const scrapedRecipe = await scrapeRecipe(url);

        // Transform into DatabaseRecipe format
        const recipe: DatabaseRecipe = {
            id: crypto.randomUUID(),
            title: scrapedRecipe.title,
            prep_time_minutes: scrapedRecipe.prep_time_minutes || null,
            cook_time_minutes: scrapedRecipe.cook_time_minutes || null,
            servings: scrapedRecipe.servings || null,
            recipe_components: [
                {
                    id: crypto.randomUUID(),
                    name: "Main Dish",
                    component_ingredients: scrapedRecipe.ingredients.map((ingredient) => ({
                        id: crypto.randomUUID(),
                        ingredient,
                    })),
                    component_instructions: scrapedRecipe.instructions.map((instruction) => ({
                        id: crypto.randomUUID(),
                        instruction,
                    })),
                },
            ],
        };

        return NextResponse.json(recipe);
    } catch (error) {
        console.error("Error processing recipe:", error);
        return NextResponse.json({ error: "Failed to process recipe" }, { status: 500 });
    }
}
