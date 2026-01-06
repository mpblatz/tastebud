import React, { useState } from "react";
import Image from "next/image";
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
        console.log("=== File Upload Started ===");
        const file = event.target.files?.[0];
        if (!file) {
            console.log("No file selected");
            return;
        }

        console.log("File selected:", {
            name: file.name,
            type: file.type,
            size: file.size,
            sizeInMB: (file.size / (1024 * 1024)).toFixed(2) + "MB",
        });

        setError("");
        setIsUploading(true);
        setUploadProgress(0);

        try {
            // File validation
            console.log("Validating file type...");
            if (!file.type.startsWith("image/")) {
                throw new Error("Please select an image file");
            }
            console.log("✓ File type is valid");

            console.log("Validating file size...");
            if (file.size > 5 * 1024 * 1024) {
                throw new Error("Image must be less than 5MB");
            }
            console.log("✓ File size is valid");

            // Simulate upload progress
            console.log("Starting progress interval...");
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
            // Use "temp" prefix for temporary recipes
            const fileName = `temp-${Date.now()}.${fileExt}`;
            console.log("Generated filename:", fileName);
            console.log("Bucket name:", bucketName);
            console.log("Recipe ID:", recipeId);

            // Upload new image
            console.log("Uploading to Supabase storage...");
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(fileName, file);

            console.log("Upload response:", { uploadData, uploadError });

            clearInterval(progressInterval);

            if (uploadError) {
                console.error("Upload error:", uploadError);
                throw uploadError;
            }
            console.log("✓ Upload successful");

            // Get public URL for the uploaded image
            console.log("Getting public URL...");
            const {
                data: { publicUrl },
            } = supabase.storage.from(bucketName).getPublicUrl(fileName);
            console.log("Public URL:", publicUrl);

            // Only update database if we have a real recipe ID (not "temp")
            if (recipeId !== "temp") {
                console.log("Updating recipe record in database...");
                const { data: updateData, error: updateError } = await supabase
                    .from("recipes")
                    .update({ main_image_url: publicUrl })
                    .eq("id", recipeId);

                console.log("Database update response:", { updateData, updateError });

                if (updateError) {
                    console.error("Database update error:", updateError);
                    throw updateError;
                }
                console.log("✓ Database updated successfully");

                // Clean up old image if it exists
                if (currentImageUrl) {
                    console.log("Cleaning up old image...");
                    console.log("Old image URL:", currentImageUrl);
                    const oldFileName = currentImageUrl.split("/").pop();
                    console.log("Old filename extracted:", oldFileName);

                    if (oldFileName) {
                        const { data: deleteData, error: deleteError } = await supabase.storage
                            .from(bucketName)
                            .remove([oldFileName]);
                        console.log("Delete old image response:", { deleteData, deleteError });

                        if (deleteError) {
                            console.warn("Failed to delete old image (non-fatal):", deleteError);
                        } else {
                            console.log("✓ Old image deleted");
                        }
                    }
                }
            } else {
                console.log("⚠ Recipe ID is 'temp', skipping database update");
            }

            setUploadProgress(100);
            console.log("Calling onImageUpdate with:", publicUrl);
            onImageUpdate(publicUrl);
            console.log("=== Upload Complete ===");
        } catch (err) {
            console.error("=== Upload Failed ===");
            console.error("Error details:", err);

            if (err instanceof Error) {
                console.error("Error message:", err.message);
            }

            setError(err instanceof Error ? err.message : "An error occurred during upload");
        } finally {
            console.log("Cleaning up...");
            setIsUploading(false);
            console.log("=== Upload Process Ended ===");
        }
    };

    const handleDelete = async () => {
        console.log("=== Image Delete Started ===");
        console.log("Recipe ID:", recipeId);
        console.log("Current image URL:", currentImageUrl);

        try {
            if (currentImageUrl) {
                const fileName = currentImageUrl.split("/").pop();
                console.log("Extracted filename:", fileName);

                if (fileName) {
                    console.log("Deleting from storage...");
                    const { data: deleteData, error: deleteError } = await supabase.storage
                        .from(bucketName)
                        .remove([fileName]);

                    console.log("Storage delete response:", { deleteData, deleteError });

                    if (deleteError) {
                        console.error("Storage delete error:", deleteError);
                        throw deleteError;
                    }
                    console.log("✓ Image deleted from storage");
                }

                // Only update database if we have a real recipe ID (not "temp")
                if (recipeId !== "temp") {
                    console.log("Updating recipe record in database...");
                    const { error: updateError } = await supabase
                        .from("recipes")
                        .update({ main_image_url: null })
                        .eq("id", recipeId);

                    console.log("Database update error:", updateError);

                    if (updateError) {
                        console.error("Database update error:", updateError);
                        throw updateError;
                    }
                    console.log("✓ Database updated successfully");
                } else {
                    console.log("⚠ Recipe ID is 'temp', skipping database update");
                }

                onImageUpdate(null);
                console.log("=== Image Delete Complete ===");
            } else {
                console.log("No image to delete");
            }
        } catch (err) {
            console.error("=== Image Delete Failed ===");
            console.error("Error details:", err);

            if (err instanceof Error) {
                console.error("Error message:", err.message);
            }

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
                    <div className="relative group h-96 w-full rounded-lg overflow-hidden">
                        <Image
                            src={currentImageUrl}
                            alt="Recipe"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 800px"
                        />
                        <div
                            className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 
                         group-hover:opacity-100 transition-opacity"
                        >
                            <label className="cursor-pointer">
                                <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                                <Button variant="secondary" size="icon" type="button" asChild>
                                    <span>
                                        <Camera className="w-4 h-4" />
                                    </span>
                                </Button>
                            </label>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="icon" type="button">
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
