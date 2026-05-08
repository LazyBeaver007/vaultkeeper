import {
  bodyFontOptions,
  editorFontScaleOptions,
  headingFontOptions,
  resolveTheme,
} from "../../app/themes";
import { useThemeStore } from "../../stores/themeStore";

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="theme-field theme-color-field">
      <span className="theme-field-label">{label}</span>
      <span className="theme-color-input">
        <span className="theme-swatch" style={{ backgroundColor: value }} />
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </span>
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | number;
  options: Array<{ value: string | number; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="theme-field">
      <span className="theme-field-label">{label}</span>
      <select
        className="theme-select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={String(option.value)} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ThemeCustomizer() {
  const activeTheme = useThemeStore((state) => state.activeTheme);
  const updateThemeToken = useThemeStore((state) => state.updateThemeToken);
  const updateGraphToken = useThemeStore((state) => state.updateGraphToken);
  const updateTypography = useThemeStore((state) => state.updateTypography);
  const resetCustomization = useThemeStore((state) => state.resetCustomization);
  const customization = useThemeStore((state) => state.customization);
  const theme = resolveTheme(activeTheme, customization);

  return (
    <section className="theme-card">
      <div className="theme-card-header">
        <div>
          <h3 className="tool-title">Theme Studio</h3>
          <p className="status-text">
            Live-tune atmosphere, typography, and future graph styling.
          </p>
        </div>

        <button type="button" onClick={resetCustomization}>
          Reset
        </button>
      </div>

      <div className="theme-preview" data-theme-preview={activeTheme}>
        <div className="theme-preview-chip" style={{ backgroundColor: theme.tokens.accent }} />
        <div>
          <strong>{theme.label}</strong>
          <p>Preset with live overrides, ready for saved community themes.</p>
        </div>
      </div>

      <div className="theme-grid">
        <ColorField
          label="Primary background"
          value={theme.tokens.bg}
          onChange={(value) => updateThemeToken("bg", value)}
        />
        <ColorField
          label="Panel background"
          value={theme.tokens.panel}
          onChange={(value) => updateThemeToken("panel", value)}
        />
        <ColorField
          label="Editor background"
          value={theme.tokens.editorBg}
          onChange={(value) => updateThemeToken("editorBg", value)}
        />
        <ColorField
          label="Sidebar background"
          value={theme.tokens.sidebarBg}
          onChange={(value) => updateThemeToken("sidebarBg", value)}
        />
        <ColorField
          label="Text color"
          value={theme.tokens.text}
          onChange={(value) => updateThemeToken("text", value)}
        />
        <ColorField
          label="Heading color"
          value={theme.tokens.heading}
          onChange={(value) => updateThemeToken("heading", value)}
        />
        <ColorField
          label="Accent color"
          value={theme.tokens.accent}
          onChange={(value) => updateThemeToken("accent", value)}
        />
        <ColorField
          label="Border color"
          value={theme.tokens.border}
          onChange={(value) => updateThemeToken("border", value)}
        />
        <ColorField
          label="Graph node"
          value={theme.graph.node}
          onChange={(value) => updateGraphToken("node", value)}
        />
        <ColorField
          label="Graph edge"
          value={theme.graph.edge}
          onChange={(value) => updateGraphToken("edge", value)}
        />
      </div>

      <div className="theme-grid">
        <SelectField
          label="Body font"
          value={theme.typography.bodyFont}
          options={bodyFontOptions}
          onChange={(value) => updateTypography("bodyFont", value)}
        />
        <SelectField
          label="Heading font"
          value={theme.typography.headingFont}
          options={headingFontOptions}
          onChange={(value) => updateTypography("headingFont", value)}
        />
        <SelectField
          label="Editor scale"
          value={theme.typography.editorScale}
          options={editorFontScaleOptions}
          onChange={(value) => updateTypography("editorScale", Number(value))}
        />
      </div>
    </section>
  );
}
