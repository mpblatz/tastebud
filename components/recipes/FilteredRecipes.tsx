"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchIcon, PlusCircle, X } from "lucide-react";
import Link from "next/link";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import type { DatabaseRecipe } from "@/types";

interface FilteredRecipesProps {
    initialRecipes: DatabaseRecipe[];
}

export default function FilteredRecipes({ initialRecipes }: FilteredRecipesProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    // Get unique tags from all recipes
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

    // Filter recipes based on search term and selected tags
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

    return (
        <div>
            <div className="flex justify-between items-center mb-4 space-x-4">
                <h1 className="text-3xl font-bold whitespace-nowrap">My Recipes</h1>
                <div className="relative w-full">
                    <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search recipes..."
                        className="w-full pl-8 pr-4"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button asChild>
                    <Link href="/recipes/new" className="flex items-center gap-2">
                        <PlusCircle className="w-4 h-4" />
                        New Recipe
                    </Link>
                </Button>
            </div>

            {allTags && allTags.length > 0 && (
                <div className="mb-6">
                    <div className="text-sm text-muted-foreground mb-2">Filter by tags:</div>
                    <div className="flex flex-wrap gap-2">
                        {allTags.map((tag) => (
                            <Button
                                key={tag}
                                variant={selectedTags.includes(tag) ? "secondary" : "outline"}
                                size="sm"
                                onClick={() => toggleTag(tag)}
                                className="flex items-center gap-1"
                            >
                                {tag}
                                {selectedTags.includes(tag) && <X className="h-3 w-3 ml-1" />}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            {filteredRecipes.length === 0 ? (
                <div className="text-center py-20 space-y-2">
                    <p>No recipes found matching your criteria.</p>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setSearchTerm("");
                            setSelectedTags([]);
                        }}
                    >
                        Clear Filters
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col space-y-4">
                    {filteredRecipes.map((recipe) => (
                        <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                </div>
            )}
        </div>
    );
}
