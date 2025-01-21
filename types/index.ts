export interface Recipe {
    id: string;
    title: string;
    prepTimeMinutes?: number;
    cookTimeMinutes?: number;
    servings?: number;
    sourceUrl?: string;
    components: RecipeComponent[];
    nutrition?: RecipeNutrition;
}

export interface RecipeComponent {
    id: string;
    name: string;
    ingredients: string[];
    instructions: string[];
    orderIndex: number;
}

export interface RecipeNutrition {
    calories?: number;
    proteinGrams?: number;
    carbsGrams?: number;
    fatGrams?: number;
}

export interface RecipeData {
    title: string;
    prepTimeMinutes?: number | null;
    cookTimeMinutes?: number | null;
    servings?: number | null;
    components: RecipeComponent[];
    mainImageUrl?: string | null;
    calories?: number | null;
    proteinGrams?: number | null;
    fatGrams?: number | null;
    carbsGrams?: number | null;
}

export interface DatabaseRecipe {
    id: string;
    title: string;
    prep_time_minutes: number | null;
    cook_time_minutes: number | null;
    servings: number | null;
    main_image_url?: string | null;
    calories?: number | null;
    protein_grams?: number | null;
    fat_grams?: number | null;
    carbs_grams?: number | null;
    recipe_components: {
        id: string;
        name: string;
        component_ingredients: { id: string; ingredient: string }[];
        component_instructions: { id: string; instruction: string }[];
    }[];
}
