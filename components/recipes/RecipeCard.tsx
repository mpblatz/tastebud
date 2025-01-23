import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Clock, ChefHat, UtensilsCrossed, LinkIcon } from "lucide-react";
import { DatabaseRecipe } from "@/types";
import { Badge } from "../ui/badge";
import { trimUrl } from "@/lib/recipe-scraper/utils";

export function RecipeCard({ recipe }: { recipe: DatabaseRecipe }) {
    const handleSourceClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent the parent Link from being triggered
    };

    return (
        <Link href={`/recipes/${recipe.id}`}>
            <Card className="hover:shadow-lg transition-shadow overflow-hidden">
                <div className="flex">
                    <div className="flex-1 min-w-0">
                        {/* min-w-0 prevents flex child from expanding */}
                        <CardHeader>
                            <CardTitle className="line-clamp-2 text-xl">{recipe.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                {recipe.import_url && (
                                    <Badge className="gap-2">
                                        <LinkIcon size={12} />
                                        {trimUrl(recipe.import_url)}
                                    </Badge>
                                )}
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
                                {recipe.recipes_tags && recipe.recipes_tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {recipe.recipes_tags.map((tag) => (
                                            <Badge variant="outline" key={tag.tag.id}>
                                                {tag.tag.name}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter></CardFooter>
                    </div>
                    <div className="w-[400px] h-[220px] bg-slate-200 flex items-center justify-center border-l overflow-hidden">
                        {recipe.main_image_url ? (
                            <img
                                src={recipe.main_image_url}
                                alt={recipe.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="text-muted-foreground">
                                <UtensilsCrossed className="w-8 h-8" />
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </Link>
    );
}
