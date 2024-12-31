// components/RecipeEditor/index.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, Eye, Edit2 } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

interface RecipeComponent {
    id: string;
    name: string;
    ingredients: string[];
    instructions: string[];
}

export interface RecipeData {
    title: string;
    prepTimeMinutes?: number;
    cookTimeMinutes?: number;
    servings?: number;
    components: RecipeComponent[];
}

export interface DatabaseRecipe {
    id: string;
    title: string;
    prep_time_minutes: number | null;
    cook_time_minutes: number | null;
    servings: number | null;
    recipe_components: {
        id: string;
        name: string;
        component_ingredients: { id: string; ingredient: string }[];
        component_instructions: { id: string; instruction: string }[];
    }[];
}

interface RecipeEditorProps {
    existingRecipe?: DatabaseRecipe;
    recipeId?: string;
    onSave?: (recipe: RecipeData) => void | Promise<void>;
}

export function RecipeEditor({ existingRecipe, recipeId, onSave }: RecipeEditorProps) {
    const router = useRouter();
    const supabase = createClientComponentClient();
    const [isPreview, setIsPreview] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Transform database recipe to editor format
    const transformDatabaseRecipe = (dbRecipe: DatabaseRecipe): RecipeData => {
        return {
            title: dbRecipe.title,
            prepTimeMinutes: dbRecipe.prep_time_minutes || undefined,
            cookTimeMinutes: dbRecipe.cook_time_minutes || undefined,
            servings: dbRecipe.servings || undefined,
            components: dbRecipe.recipe_components.map((component) => ({
                id: component.id,
                name: component.name,
                ingredients: component.component_ingredients.map((i) => i.ingredient),
                instructions: component.component_instructions.map((i) => i.instruction),
            })),
        };
    };

    const [recipe, setRecipe] = useState<RecipeData>(
        existingRecipe
            ? transformDatabaseRecipe(existingRecipe)
            : {
                  title: "",
                  components: [
                      {
                          id: "1",
                          name: "",
                          ingredients: [""],
                          instructions: [""],
                      },
                  ],
              }
    );

    const handleSave = async () => {
        try {
            setIsSaving(true);

            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                throw new Error("Not authenticated");
            }

            if (recipeId) {
                // Update existing recipe
                const { error: recipeError } = await supabase
                    .from("recipes")
                    .update({
                        title: recipe.title,
                        prep_time_minutes: recipe.prepTimeMinutes,
                        cook_time_minutes: recipe.cookTimeMinutes,
                        servings: recipe.servings,
                    })
                    .eq("id", recipeId);

                if (recipeError) throw recipeError;

                // Delete existing components and their children
                await supabase.from("recipe_components").delete().eq("recipe_id", recipeId);

                // Insert new components
                for (const component of recipe.components) {
                    const { data: newComponent, error: componentError } = await supabase
                        .from("recipe_components")
                        .insert({
                            recipe_id: recipeId,
                            name: component.name,
                            order_index: recipe.components.indexOf(component),
                        })
                        .select()
                        .single();

                    if (componentError) throw componentError;

                    // Insert ingredients
                    const ingredientInserts = component.ingredients.map((ingredient, index) => ({
                        component_id: newComponent.id,
                        ingredient,
                        order_index: index,
                    }));

                    const { error: ingredientsError } = await supabase
                        .from("component_ingredients")
                        .insert(ingredientInserts);

                    if (ingredientsError) throw ingredientsError;

                    // Insert instructions
                    const instructionInserts = component.instructions.map((instruction, index) => ({
                        component_id: newComponent.id,
                        instruction,
                        order_index: index,
                    }));

                    const { error: instructionsError } = await supabase
                        .from("component_instructions")
                        .insert(instructionInserts);

                    if (instructionsError) throw instructionsError;
                }
            } else {
                // Create new recipe
                const { data: newRecipe, error: recipeError } = await supabase
                    .from("recipes")
                    .insert({
                        title: recipe.title,
                        prep_time_minutes: recipe.prepTimeMinutes,
                        cook_time_minutes: recipe.cookTimeMinutes,
                        servings: recipe.servings,
                        user_id: user.id,
                    })
                    .select()
                    .single();

                if (recipeError) throw recipeError;

                // Insert components
                for (const component of recipe.components) {
                    const { data: newComponent, error: componentError } = await supabase
                        .from("recipe_components")
                        .insert({
                            recipe_id: newRecipe.id,
                            name: component.name,
                            order_index: recipe.components.indexOf(component),
                        })
                        .select()
                        .single();

                    if (componentError) throw componentError;

                    // Insert ingredients
                    const ingredientInserts = component.ingredients.map((ingredient, index) => ({
                        component_id: newComponent.id,
                        ingredient,
                        order_index: index,
                    }));

                    const { error: ingredientsError } = await supabase
                        .from("component_ingredients")
                        .insert(ingredientInserts);

                    if (ingredientsError) throw ingredientsError;

                    // Insert instructions
                    const instructionInserts = component.instructions.map((instruction, index) => ({
                        component_id: newComponent.id,
                        instruction,
                        order_index: index,
                    }));

                    const { error: instructionsError } = await supabase
                        .from("component_instructions")
                        .insert(instructionInserts);

                    if (instructionsError) throw instructionsError;
                }
            }

            // Call the onSave callback if provided
            if (onSave) {
                await onSave(recipe);
            }

            router.push("/recipes");
            router.refresh();
        } catch (error) {
            console.error("Error saving recipe:", error);
            // You might want to show an error toast here
        } finally {
            setIsSaving(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleSave();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{recipeId ? "Edit Recipe" : "New Recipe"}</h1>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsPreview(!isPreview)}
                        className="flex items-center gap-2"
                    >
                        {isPreview ? (
                            <>
                                <Edit2 className="w-4 h-4" />
                                Edit
                            </>
                        ) : (
                            <>
                                <Eye className="w-4 h-4" />
                                Preview
                            </>
                        )}
                    </Button>
                    <Button type="submit" disabled={isSaving} className="flex items-center gap-2">
                        {isSaving ? "Saving..." : "Save Recipe"}
                    </Button>
                </div>
            </div>

            <Card className="mt-6">
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="title">Recipe Title</Label>
                            <Input
                                id="title"
                                value={recipe.title}
                                onChange={(e) => setRecipe((prev) => ({ ...prev, title: e.target.value }))}
                                disabled={isPreview}
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="prepTime">Prep Time (minutes)</Label>
                                <Input
                                    id="prepTime"
                                    type="number"
                                    value={recipe.prepTimeMinutes || ""}
                                    onChange={(e) =>
                                        setRecipe((prev) => ({
                                            ...prev,
                                            prepTimeMinutes: e.target.value ? Number(e.target.value) : undefined,
                                        }))
                                    }
                                    disabled={isPreview}
                                />
                            </div>
                            <div>
                                <Label htmlFor="cookTime">Cook Time (minutes)</Label>
                                <Input
                                    id="cookTime"
                                    type="number"
                                    value={recipe.cookTimeMinutes || ""}
                                    onChange={(e) =>
                                        setRecipe((prev) => ({
                                            ...prev,
                                            cookTimeMinutes: e.target.value ? Number(e.target.value) : undefined,
                                        }))
                                    }
                                    disabled={isPreview}
                                />
                            </div>
                            <div>
                                <Label htmlFor="servings">Servings</Label>
                                <Input
                                    id="servings"
                                    type="number"
                                    value={recipe.servings || ""}
                                    onChange={(e) =>
                                        setRecipe((prev) => ({
                                            ...prev,
                                            servings: e.target.value ? Number(e.target.value) : undefined,
                                        }))
                                    }
                                    disabled={isPreview}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {recipe.components.map((component, componentIndex) => (
                <Card key={component.id}>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex-1">
                                    <Label htmlFor={`component-${component.id}-name`}>Component Name</Label>
                                    <Input
                                        id={`component-${component.id}-name`}
                                        value={component.name}
                                        onChange={(e) =>
                                            setRecipe((prev) => ({
                                                ...prev,
                                                components: prev.components.map((c, i) =>
                                                    i === componentIndex ? { ...c, name: e.target.value } : c
                                                ),
                                            }))
                                        }
                                        disabled={isPreview}
                                    />
                                </div>
                                {!isPreview && recipe.components.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="ml-2"
                                        onClick={() =>
                                            setRecipe((prev) => ({
                                                ...prev,
                                                components: prev.components.filter((_, i) => i !== componentIndex),
                                            }))
                                        }
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                            <div>
                                <Label>Ingredients</Label>
                                {component.ingredients.map((ingredient, ingredientIndex) => (
                                    <div key={ingredientIndex} className="flex items-center space-x-2 mt-2">
                                        <Input
                                            value={ingredient}
                                            onChange={(e) =>
                                                setRecipe((prev) => ({
                                                    ...prev,
                                                    components: prev.components.map((c, i) =>
                                                        i === componentIndex
                                                            ? {
                                                                  ...c,
                                                                  ingredients: c.ingredients.map((ing, j) =>
                                                                      j === ingredientIndex ? e.target.value : ing
                                                                  ),
                                                              }
                                                            : c
                                                    ),
                                                }))
                                            }
                                            disabled={isPreview}
                                        />
                                        {!isPreview && component.ingredients.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    setRecipe((prev) => ({
                                                        ...prev,
                                                        components: prev.components.map((c, i) =>
                                                            i === componentIndex
                                                                ? {
                                                                      ...c,
                                                                      ingredients: c.ingredients.filter(
                                                                          (_, j) => j !== ingredientIndex
                                                                      ),
                                                                  }
                                                                : c
                                                        ),
                                                    }))
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                {!isPreview && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="mt-2"
                                        onClick={() =>
                                            setRecipe((prev) => ({
                                                ...prev,
                                                components: prev.components.map((c, i) =>
                                                    i === componentIndex
                                                        ? {
                                                              ...c,
                                                              ingredients: [...c.ingredients, ""],
                                                          }
                                                        : c
                                                ),
                                            }))
                                        }
                                    >
                                        <PlusCircle className="h-4 w-4 mr-2" />
                                        Add Ingredient
                                    </Button>
                                )}
                            </div>

                            <div>
                                <Label>Instructions</Label>
                                {component.instructions.map((instruction, instructionIndex) => (
                                    <div key={instructionIndex} className="flex items-center space-x-2 mt-2">
                                        <Input
                                            value={instruction}
                                            onChange={(e) =>
                                                setRecipe((prev) => ({
                                                    ...prev,
                                                    components: prev.components.map((c, i) =>
                                                        i === componentIndex
                                                            ? {
                                                                  ...c,
                                                                  instructions: c.instructions.map((ins, j) =>
                                                                      j === instructionIndex ? e.target.value : ins
                                                                  ),
                                                              }
                                                            : c
                                                    ),
                                                }))
                                            }
                                            disabled={isPreview}
                                        />
                                        {!isPreview && component.instructions.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    setRecipe((prev) => ({
                                                        ...prev,
                                                        components: prev.components.map((c, i) =>
                                                            i === componentIndex
                                                                ? {
                                                                      ...c,
                                                                      instructions: c.instructions.filter(
                                                                          (_, j) => j !== instructionIndex
                                                                      ),
                                                                  }
                                                                : c
                                                        ),
                                                    }))
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                {!isPreview && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="mt-2"
                                        onClick={() =>
                                            setRecipe((prev) => ({
                                                ...prev,
                                                components: prev.components.map((c, i) =>
                                                    i === componentIndex
                                                        ? {
                                                              ...c,
                                                              instructions: [...c.instructions, ""],
                                                          }
                                                        : c
                                                ),
                                            }))
                                        }
                                    >
                                        <PlusCircle className="h-4 w-4 mr-2" />
                                        Add Instruction
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}

            {!isPreview && (
                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                        setRecipe((prev) => ({
                            ...prev,
                            components: [
                                ...prev.components,
                                {
                                    id: String(prev.components.length + 1),
                                    name: "",
                                    ingredients: [""],
                                    instructions: [""],
                                },
                            ],
                        }))
                    }
                >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Component
                </Button>
            )}
        </form>
    );
}
