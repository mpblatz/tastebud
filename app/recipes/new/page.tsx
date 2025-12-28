"use client";

import { useState } from "react";
import { RecipeEditor } from "@/components/recipes/RecipeEditor";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatabaseRecipe } from "@/types";

export default function NewRecipePage() {
    const supabase = createClientComponentClient();
    const [showUrlDialog, setShowUrlDialog] = useState(false);
    const [showTextDialog, setShowTextDialog] = useState(false);
    const [importUrl, setImportUrl] = useState("");
    const [importText, setImportText] = useState("");
    const [isImporting, setIsImporting] = useState(false);
    const [importedRecipe, setImportedRecipe] = useState<DatabaseRecipe | null>(null);

    const handleUrlImport = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsImporting(true);

        try {
            const response = await fetch("/api/import-recipe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url: importUrl }),
            });

            if (!response.ok) {
                throw new Error("Failed to import recipe");
            }

            const data: DatabaseRecipe = await response.json();
            console.log("Initial recipe data from API:", data);

            // Handle image upload if present
            if (data.main_image_url) {
                try {
                    console.log("Attempting to upload image from URL:", data.main_image_url);
                    const imageResponse = await fetch(data.main_image_url);
                    const blob = await imageResponse.blob();
                    const fileName = `temp-${Date.now()}.${blob.type.split("/")[1]}`;

                    console.log("Uploading image to Supabase storage...");
                    const { error: uploadError } = await supabase.storage.from("recipe-images").upload(fileName, blob);

                    if (uploadError) {
                        throw uploadError;
                    }

                    const {
                        data: { publicUrl },
                    } = supabase.storage.from("recipe-images").getPublicUrl(fileName);

                    console.log("Image uploaded successfully, public URL:", publicUrl);

                    // Create new recipe object with the uploaded image URL
                    const recipeWithImage: DatabaseRecipe = {
                        ...data,
                        main_image_url: publicUrl,
                    };

                    console.log("Setting imported recipe with new image:", recipeWithImage);
                    setImportedRecipe(recipeWithImage);
                } catch (imageError) {
                    console.error("Error handling image upload:", imageError);
                    setImportedRecipe(data);
                }
            } else {
                console.log("No image URL in recipe data, setting recipe as-is");
                setImportedRecipe(data);
            }

            setShowUrlDialog(false);
        } catch (error) {
            console.error("Error importing recipe:", error);
            setImportedRecipe(null);
        } finally {
            setIsImporting(false);
        }
    };

    const handleTextImport = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsImporting(true);

        try {
            const response = await fetch("/api/import-recipe-text", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text: importText }),
            });

            if (!response.ok) {
                throw new Error("Failed to import recipe");
            }

            const data = await response.json();
            setImportedRecipe(data);
            setShowTextDialog(false);
        } catch (error) {
            console.error("Error importing recipe:", error);
            setImportedRecipe(null);
        } finally {
            setIsImporting(false);
        }
    };

    const handleSave = async () => {
        // ... existing save logic ...
    };

    return (
        <div className="container mx-auto py-8">
            <RecipeEditor
                onSave={handleSave}
                existingRecipe={importedRecipe}
                onImportUrl={() => setShowUrlDialog(true)}
                onImportText={() => setShowTextDialog(true)}
            />

            <Dialog open={showUrlDialog} onOpenChange={setShowUrlDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Import Recipe from URL</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUrlImport} className="space-y-4">
                        <div>
                            <Input
                                type="url"
                                value={importUrl}
                                onChange={(e) => setImportUrl(e.target.value)}
                                placeholder="Paste a recipe URL"
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setShowUrlDialog(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isImporting}>
                                {isImporting ? "Importing..." : "Import Recipe"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={showTextDialog} onOpenChange={setShowTextDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Import Recipe from Text</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleTextImport} className="space-y-4">
                        <div>
                            <Textarea
                                value={importText}
                                onChange={(e) => setImportText(e.target.value)}
                                placeholder="Paste your recipe text here..."
                                className="h-64"
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setShowTextDialog(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isImporting}>
                                {isImporting ? "Importing..." : "Import Recipe"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
