"use client";

import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { SearchIcon, PlusCircle } from "lucide-react";
import Link from "next/link";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { getTagColor } from "@/lib/tag-colors";
import type { DatabaseRecipe } from "@/types";

interface FilteredRecipesProps {
    initialRecipes: DatabaseRecipe[];
    isSignedIn: boolean;
}

export default function FilteredRecipes({ initialRecipes, isSignedIn }: FilteredRecipesProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const allTags = useMemo(() => {
        const tagsSet = new Set<string>();
        initialRecipes.forEach((recipe) => {
            recipe.recipes_tags?.forEach((rt) => {
                if (rt.tag?.name) {
                    tagsSet.add(rt.tag.name);
                }
            });
        });
        return Array.from(tagsSet).sort();
    }, [initialRecipes]);

    const filteredRecipes = useMemo(() => {
        return initialRecipes.filter((recipe) => {
            const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesTags =
                selectedTags.length === 0 ||
                selectedTags.every((tag) => recipe.recipes_tags?.some((rt) => rt.tag?.name === tag));
            return matchesSearch && matchesTags;
        });
    }, [initialRecipes, searchTerm, selectedTags]);

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
    };

    const tagCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        allTags.forEach((tag) => {
            counts[tag] = initialRecipes.filter((r) => r.recipes_tags?.some((rt) => rt.tag?.name === tag)).length;
        });
        return counts;
    }, [allTags, initialRecipes]);

    return (
        <div>
            <div className="flex justify-between items-center mb-4 space-x-4">
                <div className="relative w-full">
                    <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-text-faint" />
                    <Input
                        type="text"
                        placeholder="Search recipes..."
                        className="w-full pl-9 pr-4"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {isSignedIn ? (
                    <Link
                        href="/recipes/new"
                        className="inline-flex items-center gap-2 no-underline font-mono text-[11px] tracking-[0.02em] whitespace-nowrap rounded-md px-4 py-2 bg-[var(--btn-bg)] text-text-muted border border-[var(--border)] hover:text-foreground hover:border-[var(--border-hover)] transition-all duration-200"
                    >
                        <PlusCircle className="w-3.5 h-3.5" />
                        New Recipe
                    </Link>
                ) : (
                    <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.02em] whitespace-nowrap rounded-md px-4 py-2 bg-[var(--btn-bg)] text-text-faint border border-[var(--border)] opacity-50 cursor-not-allowed">
                        <PlusCircle className="w-3.5 h-3.5" />
                        New Recipe
                    </span>
                )}
            </div>
            {allTags && allTags.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center mb-4">
                    <button
                        onClick={() => setSelectedTags([])}
                        className="font-mono text-[11.5px] tracking-[0.02em] rounded-md px-[14px] py-[7px] border transition-all duration-200"
                        style={
                            selectedTags.length === 0
                                ? {
                                      fontWeight: 600,
                                      color: "rgb(var(--text))",
                                      background: "var(--btn-bg)",
                                      borderColor: "var(--border-hover)",
                                  }
                                : {
                                      fontWeight: 400,
                                      color: "rgb(var(--text-faint))",
                                      background: "transparent",
                                      borderColor: "var(--border)",
                                  }
                        }
                    >
                        All ({initialRecipes.length})
                    </button>

                    <div style={{ width: "1px", height: "20px", background: "var(--divider)", margin: "0 4px" }} />

                    {allTags.map((tag) => {
                        const isActive = selectedTags.includes(tag);
                        const color = getTagColor(tag);
                        return (
                            <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className="font-mono text-[11.5px] tracking-[0.02em] rounded-md px-[14px] py-[7px] border transition-all duration-200"
                                style={
                                    isActive
                                        ? {
                                              fontWeight: 600,
                                              color,
                                              background: `color-mix(in srgb, ${color} 8%, transparent)`,
                                              borderColor: `color-mix(in srgb, ${color} 20%, transparent)`,
                                          }
                                        : {
                                              fontWeight: 400,
                                              color: "rgb(var(--text-faint))",
                                              background: "transparent",
                                              borderColor: "var(--border)",
                                          }
                                }
                            >
                                {tag} ({tagCounts[tag]})
                            </button>
                        );
                    })}
                </div>
            )}
            {filteredRecipes.length === 0 ? (
                <div className="text-center py-20 space-y-3">
                    <p className="text-text-muted text-[13px]">No recipes found matching your criteria.</p>
                    <button
                        onClick={() => {
                            setSearchTerm("");
                            setSelectedTags([]);
                        }}
                        className="font-mono text-[11px] tracking-[0.02em] text-text-faint border border-[var(--border)] rounded-md px-4 py-2 hover:text-foreground hover:border-[var(--border-hover)] transition-all duration-200"
                    >
                        Clear Filters
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4">
                    {filteredRecipes.map((recipe) => (
                        <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                </div>
            )}
        </div>
    );
}
