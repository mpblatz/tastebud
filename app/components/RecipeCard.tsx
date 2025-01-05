import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Clock, Users, ChefHat, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecipeCardProps {
    recipe: {
        id: string;
        title: string;
        prep_time_minutes?: number | null;
        cook_time_minutes?: number | null;
        servings?: number | null;
        main_image_url?: string | null;
        created_at: string;
    };
}

export function RecipeCard({ recipe }: RecipeCardProps) {
    return (
        <Card className="hover:shadow-lg transition-shadow overflow-hidden">
            <div className="flex">
                <div className="flex-1 min-w-0">
                    {/* min-w-0 prevents flex child from expanding */}
                    <CardHeader>
                        <CardTitle className="line-clamp-2">{recipe.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            {(recipe.prep_time_minutes || recipe.cook_time_minutes) && (
                                <div className="flex items-center gap-4">
                                    {recipe.prep_time_minutes && (
                                        <div className="flex items-center gap-1">
                                            <ChefHat className="w-4 h-4" />
                                            <span>Prep: {recipe.prep_time_minutes}m</span>
                                        </div>
                                    )}
                                    {recipe.cook_time_minutes && (
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            <span>Cook: {recipe.cook_time_minutes}m</span>
                                        </div>
                                    )}
                                </div>
                            )}
                            {recipe.servings && (
                                <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    <span>Serves {recipe.servings}</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button asChild variant="default" size="sm">
                            <Link href={`/recipes/${recipe.id}`}>View Recipe</Link>
                        </Button>
                    </CardFooter>
                </div>
                <div className="w-[400px] h-[180px] bg-slate-200 flex items-center justify-center border-l overflow-hidden">
                    {recipe.main_image_url ? (
                        <img src={recipe.main_image_url} alt={recipe.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-muted-foreground">
                            <UtensilsCrossed className="w-8 h-8" />
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
