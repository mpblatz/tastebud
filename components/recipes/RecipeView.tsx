// components/RecipeView.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppleIcon, BeefIcon, Clock, DessertIcon, FlameIcon, LinkIcon, Users, UtensilsCrossed } from "lucide-react";
import { RecipeData } from "@/types";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { trimUrl } from "@/lib/recipe-scraper/utils";

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

export function RecipeView({ recipe }: { recipe: RecipeData }) {
    const showMacros = recipe.calories || recipe.proteinGrams || recipe.carbsGrams || recipe.fatGrams;

    return (
        <div className="space-y-8">
            {recipe.import_url && (
                <Link href={recipe.import_url} target="_blank">
                    <Badge className="gap-2 p-[0.5">
                        <LinkIcon size={12} />
                        {trimUrl(recipe.import_url)}
                    </Badge>
                </Link>
            )}
            {recipe.tags && recipe.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                    {recipe.tags.map((tag) => (
                        <Badge variant="outline" key={tag.id}>
                            {tag.name}
                        </Badge>
                    ))}
                </div>
            )}
            {recipe.mainImageUrl && (
                <div className="w-full h-96 relative overflow-hidden rounded-lg">
                    <img src={recipe.mainImageUrl} alt={recipe.title} className="w-full h-full object-cover" />
                </div>
            )}
            <div className="flex space-x-4 justify-between w-full mb-8">
                {recipe.prepTimeMinutes && recipe.prepTimeMinutes > 0 && (
                    <Card className="w-full">
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
                    <Card className="w-full">
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
                    <Card className="w-full">
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

            {showMacros && (
                <div className="flex space-x-4 justify-between w-full mb-8">
                    {recipe.calories && (
                        <Card className="w-full">
                            <CardContent className="flex items-center gap-3 pt-6">
                                <FlameIcon className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Calories</p>
                                    <p className="font-medium">{recipe.calories}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {recipe.proteinGrams && (
                        <Card className="w-full">
                            <CardContent className="flex items-center gap-3 pt-6">
                                <BeefIcon className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Protein</p>
                                    <p className="font-medium">{recipe.proteinGrams}g</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {recipe.carbsGrams && (
                        <Card className="w-full">
                            <CardContent className="flex items-center gap-3 pt-6">
                                <AppleIcon className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Carbs</p>
                                    <p className="font-medium">{recipe.carbsGrams}g</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {recipe.fatGrams && (
                        <Card className="w-full">
                            <CardContent className="flex items-center gap-3 pt-6">
                                <DessertIcon className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Fat</p>
                                    <p className="font-medium">{recipe.fatGrams}g</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            <div className="space-y-8">
                {recipe.components.map((component, index) => (
                    <Card key={component.id || index} className="overflow-hidden">
                        <CardHeader className="bg-muted/50">
                            <CardTitle>{component.name || "Main Recipe"}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col space-y-8 mt-4">
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
