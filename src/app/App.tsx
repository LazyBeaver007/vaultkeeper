import {AppShell} from "../layouts/AppShell"
import { useThemeStore } from "../stores/themeStore"

export default function App() 
{
    const activeTheme = useThemeStore((state)=>state.activeTheme)
    return (
        <div data-theme={activeTheme}>
        <AppShell/>
        </div>
    );
}
