import Link from "next/link";
import Image from "next/image";
import { Clock, ChefHat, UtensilsCrossed } from "lucide-react";
import { DatabaseRecipe } from "@/types";
import { trimUrl } from "@/lib/recipe-scraper/utils";
import { getTagColor } from "@/lib/tag-colors";

export function RecipeCard({ recipe }: { recipe: DatabaseRecipe }) {
    return (
        <Link href={`/recipes/${recipe.id}`} className="no-underline group">
            <div className="flex flex-col md:flex-col max-md:flex-row rounded-lg border border-[var(--border)] bg-card shadow-card transition-all duration-300 group-hover:shadow-card-hover group-hover:border-[var(--border-hover)] overflow-hidden">
                {/* Image — 3:2 on desktop top, 120px left on mobile */}
                <div
                    className="relative w-full md:w-full max-md:w-[120px] max-md:shrink-0 overflow-hidden"
                    style={{ backgroundColor: "rgb(var(--image-bg))" }}
                >
                    <div className="aspect-[3/2] max-md:aspect-auto max-md:h-full relative">
                        {recipe.main_image_url ? (
                            <Image
                                src={recipe.main_image_url}
                                alt={recipe.title}
                                fill
                                className="object-cover transition-transform duration-400 group-hover:scale-[1.03]"
                                sizes="(max-width: 768px) 120px, 50vw"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-text-faint">
                                <UtensilsCrossed className="w-6 h-6" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 px-5 py-[18px] max-md:px-4 max-md:py-[14px] flex flex-col gap-1.5">
                    <h3 className="line-clamp-2 font-heading font-bold tracking-[-0.02em] text-foreground">{recipe.title}</h3>

                    {(recipe.prep_time_minutes || recipe.cook_time_minutes) && (
                        <div className="flex items-center gap-4 text-[11px] font-mono text-text-muted tracking-[0.02em]">
                            {recipe.prep_time_minutes && (
                                <span className="flex items-center gap-1">
                                    <ChefHat className="w-3 h-3" />
                                    {recipe.prep_time_minutes}m prep
                                </span>
                            )}
                            {recipe.cook_time_minutes && (
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {recipe.cook_time_minutes}m cook
                                </span>
                            )}
                        </div>
                    )}

                    {recipe.import_url && (
                        <span className="text-[11px] font-mono text-text-faint tracking-[0.02em] truncate">
                            {trimUrl(recipe.import_url)}
                        </span>
                    )}

                    {recipe.recipes_tags && recipe.recipes_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                            {recipe.recipes_tags.map((tag) => {
                                const color = getTagColor(tag.tag.name);
                                return (
                                    <span
                                        key={tag.tag.id}
                                        className="text-[10px] font-mono tracking-[0.03em] rounded-sm px-[7px] py-[2px]"
                                        style={{
                                            color,
                                            background: `color-mix(in srgb, ${color} 8%, transparent)`,
                                            border: `1px solid color-mix(in srgb, ${color} 18%, transparent)`,
                                        }}
                                    >
                                        {tag.tag.name}
                                    </span>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
