export type ThemeName = 
    | "codeon"
    | "parchment"
    | "neon-terminus";

export interface ThemeDefinition 
{
    id: ThemeName;
    label: string;
}
