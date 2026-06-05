export interface VaultMeta 
{
    name: string;
    version: string;
    theme: string;
}

export interface VaultState extends VaultMeta 
{
    path: string;
}
