import React, { useState } from "react";
import { Camera, Upload, Trash2 } from "lucide-react";
import { SupabaseClient } from "@supabase/supabase-js";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface RecipeImageUploadProps {
    supabase: SupabaseClient;
    recipeId: string;
    currentImageUrl?: string | null;
    onImageUpdate: (imageUrl: string | null) => void;
    bucketName?: string;
}

const RecipeImageUpload = ({
    supabase,
    recipeId,
    currentImageUrl,
    onImageUpdate,
    bucketName = "recipe-images",
}: RecipeImageUploadProps) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState("");

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setError("");
        setIsUploading(true);
        setUploadProgress(0);

        try {
            // File validation
            if (!file.type.startsWith("image/")) {
                throw new Error("Please select an image file");
            }

            if (file.size > 5 * 1024 * 1024) {
                throw new Error("Image must be less than 5MB");
            }

            // Simulate upload progress
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 95) {
                        clearInterval(progressInterval);
                        return prev;
                    }
                    return prev + 5;
                });
            }, 100);

            // Create unique filename with original extension
            const fileExt = file.name.split(".").pop();
            const fileName = `${recipeId}-${Date.now()}.${fileExt}`;

            // Upload new image
            const { error: uploadError } = await supabase.storage.from(bucketName).upload(fileName, file);

            clearInterval(progressInterval);

            if (uploadError) throw uploadError;

            // Get public URL for the uploaded image
            const {
                data: { publicUrl },
            } = supabase.storage.from(bucketName).getPublicUrl(fileName);

            // Update recipe record with new image URL
            const { error: updateError } = await supabase
                .from("recipes")
                .update({ main_image_url: publicUrl })
                .eq("id", recipeId);

            if (updateError) throw updateError;

            // Clean up old image if it exists
            if (currentImageUrl) {
                const oldFileName = currentImageUrl.split("/").pop();
                if (oldFileName) {
                    await supabase.storage.from(bucketName).remove([oldFileName]);
                }
            }

            setUploadProgress(100);
            onImageUpdate(publicUrl);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred during upload");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async () => {
        try {
            if (currentImageUrl) {
                const fileName = currentImageUrl.split("/").pop();
                if (fileName) {
                    await supabase.storage.from(bucketName).remove([fileName]);
                }

                const { error: updateError } = await supabase
                    .from("recipes")
                    .update({ main_image_url: null })
                    .eq("id", recipeId);

                if (updateError) throw updateError;

                onImageUpdate(null);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred while deleting");
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Recipe Image</CardTitle>
                <CardDescription>Upload a main image for your recipe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {currentImageUrl ? (
                    <div className="relative group">
                        <img src={currentImageUrl} alt="Recipe" className="w-full rounded-lg object-cover h-96" />
                        <div
                            className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 
                         group-hover:opacity-100 transition-opacity"
                        >
                            <label>
                                <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                                <Button variant="secondary" size="icon">
                                    <Camera className="w-4 h-4" />
                                </Button>
                            </label>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="icon">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Image</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to delete this recipe image? This action cannot be
                                            undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                ) : (
                    <label
                        className="flex flex-col items-center justify-center w-full h-96 border-2 
                         border-dashed rounded-lg cursor-pointer hover:bg-accent"
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
                        </div>
                        <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                    </label>
                )}

                {isUploading && (
                    <div className="space-y-2">
                        <Progress value={uploadProgress} />
                        <p className="text-sm text-muted-foreground text-center">Uploading... {uploadProgress}%</p>
                    </div>
                )}

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
};

export default RecipeImageUpload;
