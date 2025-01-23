import { load } from "cheerio";
import { cookingVerbs, foodItems, units } from "./dictionaries";

interface ScrapedRecipe {
    title: string;
    prep_time_minutes?: number;
    cook_time_minutes?: number;
    servings?: number;
    ingredients: string[];
    instructions: string[];
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    image_url?: string;
}
export async function scrapeRecipe(url: string): Promise<ScrapedRecipe> {
    const response = await fetch(url);
    const html = await response.text();
    const $ = load(html);

    // Try structured data first (JSON-LD)
    const structuredData = extractStructuredData($);
    if (structuredData) {
        return structuredData;
    }

    throw new Error("");

    // Try microdata if JSON-LD fails
    const microdata = extractMicrodata($);
    if (microdata) {
        return microdata;
    }

    // Fall back to heuristic parsing
    return extractWithHeuristics($);
}

function extractStructuredData($: cheerio.Root): ScrapedRecipe | null {
    const jsonLdScript = $('script[type="application/ld+json"]')
        .toArray()
        .map((element: cheerio.Element) => {
            try {
                const data = JSON.parse($(element).html() || "");
                return data["@type"] === "Recipe" ? data : null;
            } catch {
                return null;
            }
        })
        .find((data: JSON) => data !== null);

    if (!jsonLdScript) return null;

    console.log("SCRAPED DATA: ", jsonLdScript);

    // Extract nutrition information
    const nutrition = jsonLdScript.nutrition || {};
    let calories: number | undefined;
    let protein: number | undefined;
    let carbs: number | undefined;
    let fat: number | undefined;

    // Handle different nutrition data formats
    if (typeof nutrition === "object") {
        calories = parseNutritionValue(nutrition.calories);
        protein = parseNutritionValue(nutrition.proteinContent);
        carbs = parseNutritionValue(nutrition.carbohydrateContent);
        fat = parseNutritionValue(nutrition.fatContent);
    }

    // If no structured nutrition data, try looking for it in the main recipe object
    if (!calories) calories = parseNutritionValue(jsonLdScript.calories);
    if (!protein) protein = parseNutritionValue(jsonLdScript.proteinContent);
    if (!carbs) carbs = parseNutritionValue(jsonLdScript.carbohydrateContent);
    if (!fat) fat = parseNutritionValue(jsonLdScript.fatContent);

    // Extract image URL
    const imageUrl = extractImageUrl(jsonLdScript.image);

    return {
        title: jsonLdScript.name,
        prep_time_minutes: parseTime(jsonLdScript.prepTime),
        cook_time_minutes: parseTime(jsonLdScript.cookTime),
        servings: parseServings(jsonLdScript.recipeYield),
        ingredients: Array.isArray(jsonLdScript.recipeIngredient) ? jsonLdScript.recipeIngredient : [],
        instructions: Array.isArray(jsonLdScript.recipeInstructions)
            ? jsonLdScript.recipeInstructions.map((inst: any) => (typeof inst === "string" ? inst : inst.text))
            : [],
        calories,
        protein,
        carbs,
        fat,
        image_url: imageUrl,
    };
}

function extractMicrodata($: cheerio.Root): ScrapedRecipe | null {
    const title = $('[itemprop="name"]').first().text();
    const ingredients = $('[itemprop="recipeIngredient"]')
        .map((_: any, el: any) => $(el).text())
        .get();
    const instructions = $('[itemprop="recipeInstructions"]')
        .map((_: any, el: any) => $(el).text())
        .get();

    if (!title || !ingredients.length || !instructions.length) return null;

    // Extract image URL from microdata
    const imageUrl = $('[itemprop="image"]').attr("src") || $('[itemprop="image"]').attr("content");

    return {
        title,
        ingredients,
        instructions,
        prep_time_minutes: parseTime($('[itemprop="prepTime"]').attr("content")),
        cook_time_minutes: parseTime($('[itemprop="cookTime"]').attr("content")),
        servings: parseServings($('[itemprop="recipeYield"]').text()),
        image_url: imageUrl,
    };
}
function extractWithHeuristics($: cheerio.Root): ScrapedRecipe {
    // Get title from meta or page title
    const title = $('meta[property="og:title"]').attr("content") || $("title").text().split("|")[0].trim();

    // Find potential ingredient and instruction blocks
    const blocks = findRecipeBlocks($);
    const servings = findServings($);
    const times = findCookingTimes($);

    const imageUrl = findMainImage($);

    return {
        title,
        ingredients: blocks.ingredients,
        instructions: blocks.instructions,
        servings,
        ...times,
    };
}

function extractImageUrl(image: string | string[] | { url: string } | undefined): string | undefined {
    if (!image) return undefined;

    // Handle array of images (take the first one)
    if (Array.isArray(image)) {
        return extractImageUrl(image[0]);
    }

    // Handle object with url property
    if (typeof image === "object" && "url" in image) {
        return image.url;
    }

    // Handle string URL
    if (typeof image === "string") {
        return image;
    }

    return undefined;
}

function findMainImage($: cheerio.Root): string | undefined {
    // Try OpenGraph image first
    const ogImage = $('meta[property="og:image"]').attr("content");
    if (ogImage) return ogImage;

    // Try Twitter card image
    const twitterImage = $('meta[name="twitter:image"]').attr("content");
    if (twitterImage) return twitterImage;

    // Try the first large image in the content
    const firstLargeImage = $('img[src*="recipes"], img[src*="recipe"], img[src*="food"]')
        .filter((index: number, img: cheerio.Element): boolean => {
            const width = $(img).attr("width");
            const parsedWidth = width ? parseInt(width) : 0;
            return parsedWidth > 400;
        })
        .first()
        .attr("src");
    if (firstLargeImage) return firstLargeImage;

    // Try any image that seems to be the main one
    const mainImage = $("img.hero-image, img.main-image, img.recipe-image, img.featured-image").first().attr("src");
    if (mainImage) return mainImage;

    return undefined;
}

function findRecipeBlocks($: cheerio.Root) {
    const elements = $("body *").toArray();
    let bestIngredientNode = null;
    let bestInstructionNode = null;
    let highestIngredientScore = 0;
    let highestInstructionScore = 0;

    // Score each element
    elements.forEach((element: any) => {
        const $el = $(element);
        const text = $el.text().trim();

        if (!text) return;

        const ingredientScore = scoreIngredient(text);
        const instructionScore = scoreInstruction(text);

        if (ingredientScore > highestIngredientScore) {
            highestIngredientScore = ingredientScore;
            bestIngredientNode = element;
        }

        if (instructionScore > highestInstructionScore) {
            highestInstructionScore = instructionScore;
            bestInstructionNode = element;
        }
    });

    if (!bestIngredientNode || !bestInstructionNode) {
        return { ingredients: [], instructions: [] };
    }

    // Find LCA and extract content
    const lca = findLowestCommonAncestor(bestIngredientNode, bestInstructionNode);
    return extractFromLCA($, lca, bestIngredientNode, bestInstructionNode);
}

function findServings($: cheerio.Root): number | undefined {
    const servingsText = $("*")
        .toArray()
        .map((el: any) => $(el).text())
        .find((text: string) => /serves|servings|yield/i.test(text) && /\d+/.test(text));

    if (!servingsText) return undefined;

    const match = servingsText.match(/\d+/);
    return match ? parseInt(match[0]) : undefined;
}

function findCookingTimes($: cheerio.Root): { prep_time_minutes?: number; cook_time_minutes?: number } {
    const timeTexts = $("*")
        .toArray()
        .map((el: any) => ({
            text: $(el).text(),
            content: $(el).attr("content"),
        }))
        .filter(
            ({ text }: { text: string }) => /prep time|cook time|preparation|cooking/i.test(text) && /\d+/.test(text)
        );

    const times: { prep_time_minutes?: number; cook_time_minutes?: number } = {};

    timeTexts.forEach(({ text, content }: { text: string; content: any }) => {
        if (/prep time|preparation/i.test(text)) {
            times.prep_time_minutes = parseTime(content || text);
        } else if (/cook time|cooking/i.test(text)) {
            times.cook_time_minutes = parseTime(content || text);
        }
    });

    return times;
}

export function scoreIngredient(text: string): number {
    let score = 0;

    // Text length check (ingredients are usually short)
    if (text.length < 100) score += 1;

    // Check for numbers at start
    if (/^\d/.test(text)) score += 2;

    // Check for measurement units
    if (units.some((unit) => text.includes(unit))) score += 2;

    // Check for food items
    if (foodItems.some((item) => text.toLowerCase().includes(item))) score += 2;

    // Penalize for multiple sentences
    if (text.split(".").length > 2) score -= 2;

    return score;
}

export function scoreInstruction(text: string): number {
    let score = 0;

    // Length check (instructions are usually longer)
    if (text.length > 30) score += 1;

    // Check for sentence structure
    if (/^[A-Z].*[.!]$/.test(text)) score += 2;

    // Check for cooking verbs
    if (cookingVerbs.some((verb) => text.toLowerCase().includes(verb))) score += 2;

    // Check for numbers (like temperatures, times)
    if (/\d/.test(text)) score += 1;

    // Check for multiple sentences (instructions often have multiple steps)
    if (text.split(".").length > 1) score += 1;

    return score;
}

function parseTime(timeString: string | undefined): number | undefined {
    if (!timeString) return undefined;

    // Handle ISO 8601 duration format
    if (timeString.startsWith("PT")) {
        const hours = timeString.match(/(\d+)H/)?.[1];
        const minutes = timeString.match(/(\d+)M/)?.[1];

        return (hours ? parseInt(hours) * 60 : 0) + (minutes ? parseInt(minutes) : 0);
    }

    // Handle text format
    const numbers = timeString.match(/\d+/g);
    if (!numbers) return undefined;

    if (timeString.toLowerCase().includes("hour")) {
        return parseInt(numbers[0]) * 60;
    }

    return parseInt(numbers[0]);
}

function parseServings(servings: string | undefined): number | undefined {
    if (!servings) return undefined;

    const match = servings.match(/\d+/);
    return match ? parseInt(match[0]) : undefined;
}

function findLowestCommonAncestor(node1: Element, node2: Element): Element {
    const path1 = getPath(node1);
    const path2 = getPath(node2);

    let i = 0;
    while (i < path1.length && i < path2.length && path1[i] === path2[i]) {
        i++;
    }

    return path1[i - 1];
}

function parseNutritionValue(value: string | number | undefined): number | undefined {
    if (!value) return undefined;

    // If it's already a number, return it
    if (typeof value === "number") return value;

    // Convert string to lowercase for easier matching
    const str = value.toLowerCase();

    // Extract the first number from the string
    const numMatch = str.match(/\d+(\.\d+)?/);
    if (!numMatch) return undefined;

    const num = parseFloat(numMatch[0]);

    // Handle when the value is in grams (already what we want)
    if (str.includes("g")) {
        return num;
    }

    // Handle calories (we want the raw number)
    if (str.includes("kcal") || str.includes("calories") || str.includes("cal")) {
        return num;
    }

    // Handle milligrams (convert to grams)
    if (str.includes("mg")) {
        return num / 1000;
    }

    // If no unit is specified, return the number
    return num;
}

function getPath(node: Element): Element[] {
    const path: Element[] = [];
    let current = node;

    while (current) {
        path.unshift(current);
    }

    return path;
}

function extractFromLCA(
    $: cheerio.Root,
    lca: Element,
    ingredientNode: Element,
    instructionNode: Element
): { ingredients: string[]; instructions: string[] } {
    const $lca = $(lca);
    const elements = $lca.find("*").toArray();

    let inIngredientBlock = false;
    let inInstructionBlock = false;
    const ingredients: string[] = [];
    const instructions: string[] = [];

    elements.forEach((element: any) => {
        const $el = $(element);
        const text = $el.text().trim();

        if (!text) return;

        // Detect ingredient block
        if (element === ingredientNode || scoreIngredient(text) > 2) {
            inIngredientBlock = true;
            inInstructionBlock = false;
        }
        // Detect instruction block
        else if (element === instructionNode || scoreInstruction(text) > 2) {
            inIngredientBlock = false;
            inInstructionBlock = true;
        }

        if (inIngredientBlock && text) {
            ingredients.push(text);
        } else if (inInstructionBlock && text) {
            instructions.push(text);
        }
    });

    return {
        ingredients: cleanupList(ingredients),
        instructions: cleanupList(instructions),
    };
}

function cleanupList(items: string[]): string[] {
    return items
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
        .filter((item, index, self) => self.indexOf(item) === index);
}
