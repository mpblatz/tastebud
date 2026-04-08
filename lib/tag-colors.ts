/**
 * Generate a deterministic HSL color for a tag name using a hash function.
 * Uses CSS custom properties --tag-saturation and --tag-lightness so colors
 * automatically adjust per theme.
 */
function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

export function getTagColor(tagName: string): string {
    const hue = hashString(tagName) % 360;
    return `hsl(${hue}, var(--tag-saturation), var(--tag-lightness))`;
}
