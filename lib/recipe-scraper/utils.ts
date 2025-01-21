import { scoreIngredient, scoreInstruction } from ".";

export function parseTime(timeString: string | undefined): number | undefined {
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

export function parseServings(servings: string | undefined): number | undefined {
    if (!servings) return undefined;

    const match = servings.match(/\d+/);
    return match ? parseInt(match[0]) : undefined;
}

export function findLowestCommonAncestor(node1: cheerio.Element, node2: cheerio.Element): cheerio.Element {
    const path1 = getPath(node1);
    const path2 = getPath(node2);

    let i = 0;
    while (i < path1.length && i < path2.length && path1[i] === path2[i]) {
        i++;
    }

    return path1[i - 1];
}

function getPath(node: cheerio.Element): cheerio.Element[] {
    const path: cheerio.Element[] = [];
    let current: cheerio.Element | null = node;

    while (current) {
        path.unshift(current);
        current = current.parent;
    }

    return path;
}

export function extractFromLCA(
    $: cheerio.Root,
    lca: cheerio.Element,
    ingredientNode: cheerio.Element,
    instructionNode: cheerio.Element
): { ingredients: string[]; instructions: string[] } {
    const $lca = $(lca);
    const elements = $lca.find("*").toArray();

    let inIngredientBlock = false;
    let inInstructionBlock = false;
    const ingredients: string[] = [];
    const instructions: string[] = [];

    elements.forEach((element) => {
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
