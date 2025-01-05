// components/RecipeView.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Users, UtensilsCrossed } from "lucide-react";

interface RecipeViewProps {
    recipe: {
        title: string;
        prepTimeMinutes?: number | null;
        cookTimeMinutes?: number | null;
        servings?: number | null;
        mainImageUrl?: string | null;
        components: {
            id?: string;
            name: string;
            ingredients: string[];
            instructions: string[];
        }[];
    };
}

function formatTime(minutes: number | null | undefined): string {
    if (!minutes) return "";

    if (minutes < 60) {
        return `${minutes} mins`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
        return `${hours} ${hours === 1 ? "hr" : "hrs"}`;
    }

    return `${hours} ${hours === 1 ? "hr" : "hrs"} ${remainingMinutes} mins`;
}

export function RecipeView({ recipe }: RecipeViewProps) {
    return (
        <div className="space-y-8">
            {recipe.mainImageUrl && (
                <div className="w-full h-96 relative overflow-hidden rounded-lg">
                    <img src={recipe.mainImageUrl} alt={recipe.title} className="w-full h-full object-cover" />
                </div>
            )}
            <div className="grid grid-cols-3 gap-4 mb-8">
                {recipe.prepTimeMinutes && recipe.prepTimeMinutes > 0 && (
                    <Card>
                        <CardContent className="flex items-center gap-3 pt-6">
                            <Clock className="w-5 h-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Prep Time</p>
                                <p className="font-medium">{formatTime(recipe.prepTimeMinutes)}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {recipe.cookTimeMinutes && recipe.cookTimeMinutes > 0 && (
                    <Card>
                        <CardContent className="flex items-center gap-3 pt-6">
                            <UtensilsCrossed className="w-5 h-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Cook Time</p>
                                <p className="font-medium">{formatTime(recipe.cookTimeMinutes)}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {recipe.servings && (
                    <Card>
                        <CardContent className="flex items-center gap-3 pt-6">
                            <Users className="w-5 h-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Servings</p>
                                <p className="font-medium">{recipe.servings}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <div className="space-y-8">
                {recipe.components.map((component, index) => (
                    <Card key={component.id || index} className="overflow-hidden">
                        <CardHeader className="bg-muted/50">
                            <CardTitle>{component.name || "Main Recipe"}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col space-y-8">
                            <div>
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">Ingredients</h3>
                                <ul className="space-y-2">
                                    {component.ingredients.map((ingredient, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className="block w-2 h-2 mt-2 rounded-full bg-primary" />
                                            <span>{ingredient}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-4">Instructions</h3>
                                <ol className="space-y-4">
                                    {component.instructions.map((instruction, i) => (
                                        <li key={i} className="flex gap-4">
                                            <span className="flex-none w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-medium text-sm">
                                                {i + 1}
                                            </span>
                                            <p className="pt-1">{instruction}</p>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
