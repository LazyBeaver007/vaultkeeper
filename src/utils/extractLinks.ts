

export function extractLinks(content: string): string[]
{
    const matches = [...content.matchAll(/\[\[([^\]]+)\]\]/g)];

    return [...new Set(matches.map((m) => m[1]))];
}
