// components/RecipeView.tsx
import React from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecipeData } from "@/types";
import { getTagColor } from "@/lib/tag-colors";

function formatTime(minutes: number | null | undefined): string {
    if (!minutes) return "";

    if (minutes < 60) {
        return `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
        return `${hours}h`;
    }

    return `${hours}h ${remainingMinutes}m`;
}

export function RecipeView({ recipe }: { recipe: RecipeData }) {
    const showMacros = recipe.calories || recipe.proteinGrams || recipe.carbsGrams || recipe.fatGrams;
    const showMeta = recipe.prepTimeMinutes || recipe.cookTimeMinutes || recipe.servings || showMacros;

    const metaItems: { label: string; value: string }[] = [];
    if (recipe.prepTimeMinutes) metaItems.push({ label: "Prep", value: formatTime(recipe.prepTimeMinutes) });
    if (recipe.cookTimeMinutes) metaItems.push({ label: "Cook", value: formatTime(recipe.cookTimeMinutes) });
    if (recipe.servings) metaItems.push({ label: "Servings", value: String(recipe.servings) });
    if (recipe.calories) metaItems.push({ label: "Cal", value: String(recipe.calories) });
    if (recipe.proteinGrams) metaItems.push({ label: "Protein", value: `${recipe.proteinGrams}g` });
    if (recipe.carbsGrams) metaItems.push({ label: "Carbs", value: `${recipe.carbsGrams}g` });
    if (recipe.fatGrams) metaItems.push({ label: "Fat", value: `${recipe.fatGrams}g` });

    return (
        <div className="space-y-6">
            {/* Tags */}
            {recipe.tags && recipe.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                    {recipe.tags.map((tag) => {
                        const color = getTagColor(tag.name);
                        return (
                            <span
                                key={tag.id}
                                className="text-[10px] font-mono tracking-[0.03em] rounded-sm px-[7px] py-[2px]"
                                style={{
                                    color,
                                    background: `color-mix(in srgb, ${color} 8%, transparent)`,
                                    border: `1px solid color-mix(in srgb, ${color} 18%, transparent)`,
                                }}
                            >
                                {tag.name}
                            </span>
                        );
                    })}
                </div>
            )}

            {/* Image */}
            {recipe.mainImageUrl && (
                <div className="relative w-full h-96 overflow-hidden rounded-lg">
                    <Image
                        src={recipe.mainImageUrl}
                        alt={recipe.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                        priority
                    />
                </div>
            )}

            {/* Inline metadata bar */}
            {showMeta && (
                <div className="flex flex-wrap items-center gap-x-0 gap-y-2 border border-[var(--border)] rounded-lg overflow-hidden">
                    {metaItems.map((item, i) => (
                        <div
                            key={item.label}
                            className={`flex items-center gap-2 px-4 py-2.5 ${i < metaItems.length - 1 ? "border-r border-[var(--border)]" : ""}`}
                        >
                            <span className="text-[10px] font-mono text-text-faint tracking-[0.04em] uppercase">{item.label}</span>
                            <span className="text-[14px] font-body font-medium">{item.value}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Recipe components */}
            <div className="space-y-6">
                {recipe.components.map((component, index) => (
                    <Card key={component.id || index} className="overflow-hidden">
                        <CardHeader className="bg-[var(--btn-bg)]">
                            <CardTitle className="font-heading tracking-[-0.02em]">{component.name || "Main Recipe"}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col space-y-6">
                            <div>
                                <h3 className="font-semibold mb-3">Ingredients</h3>
                                <ul className="space-y-1.5">
                                    {component.ingredients.map((ingredient, i) => (
                                        <li key={i} className="flex items-start gap-2 text-[15px]">
                                            <span className="block w-1.5 h-1.5 mt-[9px] rounded-full bg-accent shrink-0" />
                                            <span>{ingredient}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="border-t border-[var(--divider)] pt-6">
                                <h3 className="font-semibold mb-3">Instructions</h3>
                                <ol className="space-y-3">
                                    {component.instructions.map((instruction, i) => (
                                        <li key={i} className="flex gap-3">
                                            <span className="flex-none w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center font-mono text-[11px] text-accent">
                                                {i + 1}
                                            </span>
                                            <p className="pt-0.5 text-[15px]">{instruction}</p>
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
