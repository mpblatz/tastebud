// components/RecipeEditor/index.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, Eye, Edit2, TextIcon, LinkIcon, X } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { RecipeView } from "./RecipeView";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { DatabaseRecipe, RecipeData } from "@/types";
import RecipeImageUpload from "./RecipeImageUpload";

interface RecipeEditorProps {
    existingRecipe?: DatabaseRecipe | null;
    recipeId?: string;
    onSave?: (recipe: RecipeData) => void | Promise<void>;
    onDelete?: () => void | Promise<void>;
    onImportUrl?: () => void | Promise<void>;
    onImportText?: () => void | Promise<void>;
}

export function RecipeEditor({
    existingRecipe,
    recipeId,
    onSave,
    onDelete,
    onImportUrl,
    onImportText,
}: RecipeEditorProps) {
    const router = useRouter();
    const supabase = createClientComponentClient();
    const [mainImageUrl, setMainImageUrl] = useState<string | null>(existingRecipe?.main_image_url || null);
    const [isPreview, setIsPreview] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (existingRecipe) {
            const transformedRecipe = transformDatabaseRecipe(existingRecipe);
            setRecipe(transformedRecipe);
        }
    }, [existingRecipe]);

    const transformDatabaseRecipe = (dbRecipe: DatabaseRecipe | null | undefined): RecipeData => {
        if (!dbRecipe) {
            return {
                title: "",
                mainImageUrl: null,
                components: [
                    {
                        id: "1",
                        name: "",
                        ingredients: [""],
                        instructions: [""],
                        orderIndex: 0,
                    },
                ],
            };
        }
        return {
            title: dbRecipe.title,
            prepTimeMinutes: dbRecipe.prep_time_minutes || undefined,
            cookTimeMinutes: dbRecipe.cook_time_minutes || undefined,
            servings: dbRecipe.servings || undefined,
            mainImageUrl: dbRecipe.main_image_url || null,
            calories: dbRecipe.calories || undefined,
            fatGrams: dbRecipe.fat_grams || undefined,
            carbsGrams: dbRecipe.carbs_grams || undefined,
            proteinGrams: dbRecipe.protein_grams || undefined,
            components: dbRecipe.recipe_components.map((component, index) => ({
                id: component.id,
                name: component.name,
                ingredients: component.component_ingredients.map((i) => i.ingredient),
                instructions: component.component_instructions.map((i) => i.instruction),
                orderIndex: index,
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
                          orderIndex: 0,
                      },
                  ],
              }
    );

    const handleSave = async () => {
        try {
            console.log("Starting handleSave with recipeId:", recipeId);
            console.log("Current recipe state:", recipe);
            setIsSaving(true);

            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                throw new Error("Not authenticated");
            }

            if (recipeId) {
                // Delete all related data in the correct order based on foreign key relationships
                console.log("Starting deletion process for recipe ID:", recipeId);

                // Verify user has access before attempting deletion
                const {
                    data: { user },
                    error: userError,
                } = await supabase.auth.getUser();
                if (userError) {
                    console.error("Auth error:", userError);
                    throw userError;
                }
                console.log("Current user:", user?.id);

                // First verify the recipe exists and user has access
                const { data: recipeCheck, error: recipeCheckError } = await supabase
                    .from("recipes")
                    .select("id, user_id")
                    .eq("id", recipeId)
                    .single();

                console.log("Recipe check:", recipeCheck);
                if (recipeCheckError) {
                    console.error("Recipe check error:", recipeCheckError);
                    throw recipeCheckError;
                }

                if (!recipeCheck) {
                    console.error("Recipe not found");
                    throw new Error("Recipe not found");
                }

                if (recipeCheck.user_id !== user?.id) {
                    console.error("User does not own this recipe");
                    throw new Error("Unauthorized");
                }

                console.log("Starting transaction for recipe update...");

                // Start a transaction
                const { error: transactionError } = await supabase.rpc("delete_recipe_components", {
                    recipe_id_param: recipeId,
                });

                if (transactionError) {
                    console.error("Transaction error:", transactionError);
                    throw transactionError;
                }

                // Verify deletion
                const { data: afterDelete, error: verifyError } = await supabase
                    .from("recipe_components")
                    .select(
                        `
                        id,
                        name,
                        recipe_id,
                        component_ingredients ( id ),
                        component_instructions ( id )
                    `
                    )
                    .eq("recipe_id", recipeId);

                console.log("After deletion check:", afterDelete);

                try {
                    // 1. First, get all component IDs for this recipe
                    const { data: components, error: fetchError } = await supabase
                        .from("recipe_components")
                        .select("id")
                        .eq("recipe_id", recipeId);

                    if (fetchError) throw fetchError;
                    console.log("Found components:", components);

                    if (components && components.length > 0) {
                        // 3. Delete all ingredients for all components
                        const { error: ingredientsError } = await supabase
                            .from("component_ingredients")
                            .delete()
                            .in(
                                "component_id",
                                components.map((c) => c.id)
                            );

                        if (ingredientsError) throw ingredientsError;
                        console.log("Deleted ingredients");

                        // 4. Delete all instructions for all components
                        const { error: instructionsError } = await supabase
                            .from("component_instructions")
                            .delete()
                            .in(
                                "component_id",
                                components.map((c) => c.id)
                            );

                        if (instructionsError) throw instructionsError;
                        console.log("Deleted instructions");

                        // 5. Finally delete the components themselves
                        const { error: componentsError } = await supabase
                            .from("recipe_components")
                            .delete()
                            .eq("recipe_id", recipeId);

                        if (componentsError) throw componentsError;
                        console.log("Deleted components");
                    }

                    // Don't delete the recipe itself since we're going to update it
                    console.log("Successfully deleted all related data");
                } catch (error) {
                    console.error("Error during deletion process:", error);
                    throw error;
                }

                // Update existing recipe
                const { error: recipeError } = await supabase
                    .from("recipes")
                    .update({
                        title: recipe.title,
                        prep_time_minutes: recipe.prepTimeMinutes,
                        cook_time_minutes: recipe.cookTimeMinutes,
                        servings: recipe.servings,
                        main_image_url: mainImageUrl,
                        calories: recipe.calories,
                        protein_grams: recipe.proteinGrams,
                        carbs_grams: recipe.carbsGrams,
                        fat_grams: recipe.fatGrams,
                    })
                    .eq("id", recipeId);

                if (recipeError) throw recipeError;

                // Insert new components
                for (const component of recipe.components) {
                    const { data: newComponent, error: componentError } = await supabase
                        .from("recipe_components")
                        .insert({
                            recipe_id: recipeId,
                            name: component.name,
                            order_index: component.orderIndex,
                        })
                        .select()
                        .single();

                    if (componentError) throw componentError;

                    // Insert ingredients
                    if (component.ingredients.length > 0) {
                        const ingredientInserts = component.ingredients
                            .filter((ingredient) => ingredient.trim() !== "")
                            .map((ingredient, index) => ({
                                component_id: newComponent.id,
                                ingredient,
                                order_index: index,
                            }));

                        if (ingredientInserts.length > 0) {
                            const { error: ingredientsError } = await supabase
                                .from("component_ingredients")
                                .insert(ingredientInserts);

                            if (ingredientsError) throw ingredientsError;
                        }
                    }

                    // Insert instructions
                    if (component.instructions.length > 0) {
                        const instructionInserts = component.instructions
                            .filter((instruction) => instruction.trim() !== "")
                            .map((instruction, index) => ({
                                component_id: newComponent.id,
                                instruction,
                                order_index: index,
                            }));

                        if (instructionInserts.length > 0) {
                            const { error: instructionsError } = await supabase
                                .from("component_instructions")
                                .insert(instructionInserts);

                            if (instructionsError) throw instructionsError;
                        }
                    }
                }
            } else {
                // Create new recipe logic remains the same...
                const { data: newRecipe, error: recipeError } = await supabase
                    .from("recipes")
                    .insert({
                        title: recipe.title,
                        prep_time_minutes: recipe.prepTimeMinutes,
                        cook_time_minutes: recipe.cookTimeMinutes,
                        servings: recipe.servings,
                        main_image_url: mainImageUrl,
                        calories: recipe.calories,
                        protein_grams: recipe.proteinGrams,
                        carbs_grams: recipe.carbsGrams,
                        fat_grams: recipe.fatGrams,
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
                            order_index: component.orderIndex,
                        })
                        .select()
                        .single();

                    if (componentError) throw componentError;

                    // Insert ingredients
                    if (component.ingredients.length > 0) {
                        const ingredientInserts = component.ingredients
                            .filter((ingredient) => ingredient.trim() !== "")
                            .map((ingredient, index) => ({
                                component_id: newComponent.id,
                                ingredient,
                                order_index: index,
                            }));

                        if (ingredientInserts.length > 0) {
                            const { error: ingredientsError } = await supabase
                                .from("component_ingredients")
                                .insert(ingredientInserts);

                            if (ingredientsError) throw ingredientsError;
                        }
                    }

                    // Insert instructions
                    if (component.instructions.length > 0) {
                        const instructionInserts = component.instructions
                            .filter((instruction) => instruction.trim() !== "")
                            .map((instruction, index) => ({
                                component_id: newComponent.id,
                                instruction,
                                order_index: index,
                            }));

                        if (instructionInserts.length > 0) {
                            const { error: instructionsError } = await supabase
                                .from("component_instructions")
                                .insert(instructionInserts);

                            if (instructionsError) throw instructionsError;
                        }
                    }
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

    const handleDelete = async () => {
        if (!onDelete) return;

        try {
            setIsDeleting(true);
            await onDelete();
        } catch (error) {
            console.error("Error deleting recipe:", error);
            // You might want to show an error toast here
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleSave();
    };

    return (
        <div>
            <div className="space-y-6 mb-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-4xl font-bold tracking-tight">{recipeId ? "Edit Recipe" : "New Recipe"}</h1>
                    {!recipeId && (onImportUrl || onImportText) && (
                        <div className="flex gap-2">
                            {onImportUrl && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onImportUrl}
                                    className="flex items-center gap-2"
                                >
                                    <LinkIcon className="w-4 h-4" />
                                    Import from URL
                                </Button>
                            )}
                            {onImportText && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onImportText}
                                    className="flex items-center gap-2"
                                >
                                    <TextIcon className="w-4 h-4" />
                                    Import from Plain Text
                                </Button>
                            )}
                        </div>
                    )}
                    {recipeId && (
                        <Button asChild variant="outline">
                            <Link href={`/recipes/${recipeId}`} className="flex items-center gap-2">
                                <X className="w-4 h-4" />
                                Cancel Edit
                            </Link>
                        </Button>
                    )}
                </div>

                <Separator />

                <div className="flex justify-end gap-2">
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
                    {recipeId && !isPreview && (
                        <>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                {isDeleting ? "Deleting..." : "Delete Recipe"}
                            </Button>
                        </>
                    )}
                    <Button
                        type="submit"
                        disabled={isSaving}
                        className="flex items-center gap-2"
                        onClick={handleSubmit}
                    >
                        {isSaving ? "Saving..." : "Save Recipe"}
                    </Button>
                </div>
            </div>

            {isPreview ? (
                <RecipeView recipe={{ ...recipe, mainImageUrl }} />
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>General Information</CardTitle>
                        </CardHeader>
                        <CardContent>
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
                                                    prepTimeMinutes: e.target.value
                                                        ? Number(e.target.value)
                                                        : undefined,
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
                                                    cookTimeMinutes: e.target.value
                                                        ? Number(e.target.value)
                                                        : undefined,
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

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Nutrition Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-4 gap-4">
                                <div>
                                    <Label htmlFor="calories">Calories (kcal)</Label>
                                    <Input
                                        id="calories"
                                        type="number"
                                        value={recipe.calories || ""}
                                        onChange={(e) =>
                                            setRecipe((prev) => ({
                                                ...prev,
                                                calories: e.target.value ? Number(e.target.value) : undefined,
                                            }))
                                        }
                                        disabled={isPreview}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="protein">Protein (grams)</Label>
                                    <Input
                                        id="protein"
                                        type="number"
                                        value={recipe.proteinGrams || ""}
                                        onChange={(e) =>
                                            setRecipe((prev) => ({
                                                ...prev,
                                                proteinGrams: e.target.value ? Number(e.target.value) : undefined,
                                            }))
                                        }
                                        disabled={isPreview}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="carbs">Carbs (grams)</Label>
                                    <Input
                                        id="carbs"
                                        type="number"
                                        value={recipe.carbsGrams || ""}
                                        onChange={(e) =>
                                            setRecipe((prev) => ({
                                                ...prev,
                                                carbsGrams: e.target.value ? Number(e.target.value) : undefined,
                                            }))
                                        }
                                        disabled={isPreview}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="fat">Fat (grams)</Label>
                                    <Input
                                        id="fat"
                                        type="number"
                                        value={recipe.fatGrams || ""}
                                        onChange={(e) =>
                                            setRecipe((prev) => ({
                                                ...prev,
                                                fatGrams: e.target.value ? Number(e.target.value) : undefined,
                                            }))
                                        }
                                        disabled={isPreview}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <RecipeImageUpload
                        supabase={supabase}
                        recipeId={recipeId || "temp"}
                        currentImageUrl={mainImageUrl}
                        onImageUpdate={(imageUrl) => {
                            setMainImageUrl(imageUrl);
                            setRecipe((prev) => ({
                                ...prev,
                                mainImageUrl: imageUrl,
                            }));
                        }}
                    />

                    {recipe.components.map((component, componentIndex) => (
                        <Card key={component.id}>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Component {componentIndex + 1}</CardTitle>
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
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
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
                                                                              j === ingredientIndex
                                                                                  ? e.target.value
                                                                                  : ing
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
                                                                              j === instructionIndex
                                                                                  ? e.target.value
                                                                                  : ins
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
                                            orderIndex: prev.components.length,
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
            )}
        </div>
    );
}
