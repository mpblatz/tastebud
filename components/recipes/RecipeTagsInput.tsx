import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Tag {
    id: string;
    name: string;
}
interface RecipeTagsProps {
    existingTags?: Tag[];
    onTagsChange: (tags: Tag[]) => void;
    disabled?: boolean;
}

const RecipeTagsInput: React.FC<RecipeTagsProps> = ({ existingTags = [], onTagsChange, disabled = false }) => {
    const [searchText, setSearchText] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchTags = async () => {
            const supabase = createClient();
            const { data, error } = await supabase.from("tags").select("*").order("name");

            if (error) {
                console.error("Error fetching tags:", error);
                return;
            }

            setAllTags(data);
        };

        fetchTags();
    }, []);

    useEffect(() => {
        // Handle clicks outside of suggestions box
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredTags = allTags.filter(
        (tag) =>
            tag.name.toLowerCase().includes(searchText.toLowerCase()) &&
            !existingTags.some((selected) => selected.id === tag.id)
    );

    const handleTagSelect = (tag: Tag) => {
        const updatedTags = [...existingTags, tag];
        onTagsChange(updatedTags);
        setSearchText("");
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    const handleRemoveTag = (tagId: string) => {
        const updatedTags = existingTags.filter((tag) => tag.id !== tagId);
        onTagsChange(updatedTags);
    };

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && searchText.trim()) {
            e.preventDefault();

            // Check if tag already exists
            const existingTag = allTags.find((tag) => tag.name.toLowerCase() === searchText.toLowerCase());

            if (existingTag) {
                if (!existingTags.some((tag) => tag.id === existingTag.id)) {
                    handleTagSelect(existingTag);
                }
            } else {
                // Create new tag
                console.log("Attempting to create new tag with name:", searchText.trim());
                const supabase = createClient();
                const { data, error } = await supabase
                    .from("tags")
                    .insert([{ name: searchText.trim() }])
                    .select()
                    .single();

                if (error) {
                    console.error("Error creating tag:", error);
                    console.error("Error details:", {
                        code: error.code,
                        message: error.message,
                        details: error.details,
                        hint: error.hint,
                    });
                    return;
                }

                console.log("Successfully created tag:", data);

                if (data) {
                    setAllTags([...allTags, data]);
                    handleTagSelect(data);
                }
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="relative">
                <Input
                    ref={inputRef}
                    placeholder="Search or create tags..."
                    value={searchText}
                    onChange={(e) => {
                        setSearchText(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                />

                {showSuggestions && searchText && (
                    <div
                        ref={suggestionsRef}
                        className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-auto"
                    >
                        {filteredTags.length > 0 ? (
                            filteredTags.map((tag) => (
                                <div
                                    key={tag.id}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => handleTagSelect(tag)}
                                >
                                    {tag.name}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-2 text-gray-500">
                                Press Enter to create &quot;{searchText}&quot;
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex flex-wrap gap-2">
                {existingTags.map((tag) => (
                    <Badge variant="outline" key={tag.id} className="flex items-center gap-1">
                        <p>{tag.name}</p>
                        {!disabled && (
                            <X
                                className="w-3 h-3 cursor-pointer hover:text-red-500"
                                onClick={() => handleRemoveTag(tag.id)}
                            />
                        )}
                    </Badge>
                ))}
            </div>
        </div>
    );
};

export default RecipeTagsInput;
