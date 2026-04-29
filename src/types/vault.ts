export interface VaultMeta 
{
    name: string;
    verson: string;
    theme: string;
}

export interface VaultState extends VaultMeta 
{
    path: string;
}
