"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { RecipeEditor } from "@/app/components/RecipeEditor";

export default function ImportRecipePage() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [recipeData, setRecipeData] = useState(null);
    const router = useRouter();

    const handleImport = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/import-recipe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url }),
            });

            const data = await response.json();
            setRecipeData(data);
        } catch (error) {
            console.error("Error importing recipe:", error);
        } finally {
            setLoading(false);
        }
    };

    if (recipeData) {
        return (
            <RecipeEditor
                existingRecipe={recipeData}
                onSave={async (data: any) => {
                    // Handle save
                    console.log(data);
                }}
            />
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Import Recipe</h1>
            <Card className="p-6">
                <form onSubmit={handleImport} className="space-y-4">
                    <div>
                        <label htmlFor="url" className="block text-sm font-medium mb-2">
                            Recipe URL
                        </label>
                        <Input
                            id="url"
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Paste a recipe URL"
                            required
                        />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? "Importing..." : "Import Recipe"}
                    </Button>
                </form>
            </Card>
        </div>
    );
}
