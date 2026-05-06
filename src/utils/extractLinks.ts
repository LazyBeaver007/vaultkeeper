

export function extractLinks(content: string): string[]
{
    const matches = [...content.matchAll(/\[\[([^\]]+)\]\]/g)];

    return matches.map((m) => m[1]);
}
