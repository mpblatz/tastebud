// components/RecipeView.tsx
"use client";

import React, { useState } from "react";
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

function ComponentCard({ component }: { component: RecipeData["components"][number] }) {
    const [tab, setTab] = useState<"ingredients" | "instructions">("ingredients");
    const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
    const [checkedInstructions, setCheckedInstructions] = useState<Set<number>>(new Set());

    const toggleIngredient = (i: number) => {
        setCheckedIngredients((prev) => {
            const next = new Set(prev);
            if (next.has(i)) next.delete(i); else next.add(i);
            return next;
        });
    };

    const toggleInstruction = (i: number) => {
        setCheckedInstructions((prev) => {
            const next = new Set(prev);
            if (next.has(i)) next.delete(i); else next.add(i);
            return next;
        });
    };

    // Sort ingredients: unchecked first, checked last, preserving original order within each group
    const sortedIngredients = component.ingredients
        .map((ingredient, i) => ({ ingredient, originalIndex: i }))
        .sort((a, b) => {
            const aChecked = checkedIngredients.has(a.originalIndex);
            const bChecked = checkedIngredients.has(b.originalIndex);
            if (aChecked === bChecked) return a.originalIndex - b.originalIndex;
            return aChecked ? 1 : -1;
        });

    return (
        <Card className="overflow-hidden">
            <CardHeader className="bg-[var(--btn-bg)]">
                <div className="flex items-center justify-between">
                    <CardTitle className="font-heading tracking-[-0.02em]">{component.name || "Main Recipe"}</CardTitle>
                    <div className="flex items-center rounded-md p-[3px]" style={{ background: "var(--toggle-bg)" }}>
                        <button
                            onClick={() => setTab("ingredients")}
                            className={`font-mono text-[11px] tracking-[0.02em] px-3 py-1 rounded-[6px] transition-all duration-150 ${
                                tab === "ingredients" ? "shadow-toggle text-foreground" : "text-text-muted"
                            }`}
                            style={tab === "ingredients" ? { background: "var(--toggle-active)" } : {}}
                        >
                            Ingredients
                        </button>
                        <button
                            onClick={() => setTab("instructions")}
                            className={`font-mono text-[11px] tracking-[0.02em] px-3 py-1 rounded-[6px] transition-all duration-150 ${
                                tab === "instructions" ? "shadow-toggle text-foreground" : "text-text-muted"
                            }`}
                            style={tab === "instructions" ? { background: "var(--toggle-active)" } : {}}
                        >
                            Instructions
                        </button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="py-6 px-6">
                {tab === "ingredients" ? (
                    <ul className="space-y-2.5">
                        {sortedIngredients.map(({ ingredient, originalIndex }) => {
                            const checked = checkedIngredients.has(originalIndex);
                            return (
                                <li
                                    key={originalIndex}
                                    onClick={() => toggleIngredient(originalIndex)}
                                    className="flex items-start gap-3 text-[15px] cursor-pointer select-none transition-opacity duration-150"
                                    style={{ opacity: checked ? 0.4 : 1 }}
                                >
                                    <span
                                        className="block w-1.5 h-1.5 mt-[9px] rounded-full shrink-0 transition-colors duration-150"
                                        style={{ background: checked ? "rgb(var(--text-faint))" : "rgb(var(--link-color))" }}
                                    />
                                    <span className={checked ? "line-through" : ""}>{ingredient}</span>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <ol className="space-y-4">
                        {component.instructions.map((instruction, i) => {
                            const checked = checkedInstructions.has(i);
                            return (
                                <li
                                    key={i}
                                    onClick={() => toggleInstruction(i)}
                                    className="flex gap-3 cursor-pointer select-none transition-opacity duration-150"
                                    style={{ opacity: checked ? 0.4 : 1 }}
                                >
                                    <span
                                        className="flex-none w-6 h-6 rounded-full flex items-center justify-center font-mono text-[11px] transition-colors duration-150"
                                        style={checked
                                            ? { background: "rgb(var(--text-faint) / 0.1)", color: "rgb(var(--text-faint))" }
                                            : { background: "rgb(var(--link-color) / 0.1)", color: "rgb(var(--link-color))" }
                                        }
                                    >
                                        {i + 1}
                                    </span>
                                    <p className={`pt-0.5 text-[15px] ${checked ? "line-through" : ""}`}>{instruction}</p>
                                </li>
                            );
                        })}
                    </ol>
                )}
            </CardContent>
        </Card>
    );
}

export function RecipeView({ recipe }: { recipe: RecipeData }) {
    const cookingItems: { label: string; value: string }[] = [];
    if (recipe.prepTimeMinutes) cookingItems.push({ label: "Prep", value: formatTime(recipe.prepTimeMinutes) });
    if (recipe.cookTimeMinutes) cookingItems.push({ label: "Cook", value: formatTime(recipe.cookTimeMinutes) });
    if (recipe.servings) cookingItems.push({ label: "Servings", value: String(recipe.servings) });

    const nutritionItems: { label: string; value: string }[] = [];
    if (recipe.calories) nutritionItems.push({ label: "Cal", value: String(recipe.calories) });
    if (recipe.proteinGrams) nutritionItems.push({ label: "Protein", value: `${recipe.proteinGrams}g` });
    if (recipe.carbsGrams) nutritionItems.push({ label: "Carbs", value: `${recipe.carbsGrams}g` });
    if (recipe.fatGrams) nutritionItems.push({ label: "Fat", value: `${recipe.fatGrams}g` });

    const showMeta = cookingItems.length > 0 || nutritionItems.length > 0;

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
                <div className="flex items-center justify-between border border-[var(--border)] rounded-lg overflow-hidden">
                    {cookingItems.length > 0 && (
                        <div className="flex items-center">
                            {cookingItems.map((item, i) => (
                                <div
                                    key={item.label}
                                    className={`flex items-center gap-2 px-4 py-2.5 ${i < cookingItems.length - 1 || nutritionItems.length > 0 ? "border-r border-[var(--border)]" : ""}`}
                                >
                                    <span className="text-[10px] font-mono text-text-faint tracking-[0.04em] uppercase">{item.label}</span>
                                    <span className="text-[14px] font-body font-medium">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {nutritionItems.length > 0 && (
                        <div className="flex items-center ml-auto">
                            {nutritionItems.map((item, i) => (
                                <div
                                    key={item.label}
                                    className={`flex items-center gap-2 px-4 py-2.5 ${i < nutritionItems.length - 1 ? "border-r border-[var(--border)]" : ""}`}
                                >
                                    <span className="text-[10px] font-mono text-text-faint tracking-[0.04em] uppercase">{item.label}</span>
                                    <span className="text-[14px] font-body font-medium">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Recipe components */}
            <div className="space-y-6">
                {recipe.components.map((component, index) => (
                    <ComponentCard key={component.id || index} component={component} />
                ))}
            </div>
        </div>
    );
}
