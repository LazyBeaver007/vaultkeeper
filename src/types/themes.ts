export type ThemeName = 
    | "codeon"
    | "parchment"
    | "neon-terminus"
    | "sea-glass";

export interface ThemeDefinition 
{
    id: ThemeName;
    label: string;
}
