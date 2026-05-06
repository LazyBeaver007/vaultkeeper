import {create} from "zustand";

interface BacklinkState 
{
    backlinks: string[];
    setBackLinks: (links: string[]) => void;
}

export const  useBacklinkStore = create<BacklinkState>((set) =>(
    {
        backlinks: [],
        setBackLinks: (links) => set({backlinks: links}),
    }
) );
