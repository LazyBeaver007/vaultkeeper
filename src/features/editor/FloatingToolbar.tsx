import type { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import clsx from "clsx";
import type { BubbleMenuPluginProps } from "@tiptap/extension-bubble-menu";
import { NodeSelection } from "@tiptap/pm/state";
import { bodyFontOptions } from "../../app/themes";

interface FloatingToolbarProps {
  editor: Editor;
}

interface ToolbarButtonProps {
  label: string;
  title: string;
  isActive: boolean;
  onClick: () => void;
}

type ShouldShowProps = NonNullable<BubbleMenuPluginProps["shouldShow"]> extends (
  props: infer T,
) => boolean
  ? T
  : never;

const fontSizeOptions = [
  { value: "inherit", label: "Base" },
  { value: "0.95rem", label: "S" },
  { value: "1rem", label: "M" },
  { value: "1.1rem", label: "L" },
  { value: "1.2rem", label: "XL" },
];

const fontFamilyOptions = [
  { value: "inherit", label: "Body" },
  ...bodyFontOptions,
];

const alignmentOptions = [
  { value: "left", label: "L" },
  { value: "center", label: "C" },
  { value: "right", label: "R" },
  { value: "justify", label: "J" },
] as const;

function ToolbarButton({
  label,
  title,
  isActive,
  onClick,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className={clsx("editor-toolbar-button", isActive && "is-active")}
      aria-label={title}
      aria-pressed={isActive}
      title={title}
      onMouseDown={(event) => {
        event.preventDefault();
      }}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export function FloatingToolbar({ editor }: FloatingToolbarProps) {
  const textStyle = editor.getAttributes("textStyle");
  const currentTextColor = textStyle.color || "#f5f5f5";
  const currentHighlightColor = textStyle.backgroundColor || "#f6e58d";
  const currentFontFamily = textStyle.fontFamily || "inherit";
  const currentFontSize = textStyle.fontSize || "inherit";
  const imageSelected =
    editor.state.selection instanceof NodeSelection &&
    editor.state.selection.node.type.name === "image";

  return (
    <BubbleMenu
      editor={editor}
      className="editor-bubble-menu"
      options={{
        placement: "top",
        offset: 14,
      }}
      shouldShow={({ editor, element, from, to }: ShouldShowProps) => {
        const activeElement = document.activeElement;
        const interactingWithToolbar =
          activeElement instanceof HTMLElement && element.contains(activeElement);
        const imageNodeSelected =
          editor.state.selection instanceof NodeSelection &&
          editor.state.selection.node.type.name === "image";

        if (!editor.isEditable) {
          return false;
        }

        if (!imageNodeSelected && from === to) {
          return false;
        }

        if (!editor.isFocused && !interactingWithToolbar) {
          return false;
        }

        return imageNodeSelected || !editor.state.selection.empty;
      }}
    >
      {imageSelected ? (
        <div className="editor-toolbar-group" aria-label="Image controls">
          <span className="editor-toolbar-hint">Drag to place anywhere. Drag corners to resize.</span>
          <span className="editor-toolbar-divider" aria-hidden="true" />
          {(["left", "center", "right"] as const).map((option) => (
            <ToolbarButton
              key={option}
              label={option === "left" ? "L" : option === "center" ? "C" : "R"}
              title={`Align image ${option}`}
              isActive={editor.getAttributes("image").align === option}
              onClick={() => editor.chain().focus().setImageAlignment(option).run()}
            />
          ))}
          <span className="editor-toolbar-divider" aria-hidden="true" />
          <ToolbarButton
            label="Del"
            title="Delete image"
            isActive={false}
            onClick={() => editor.chain().focus().deleteSelection().run()}
          />
        </div>
      ) : (
        <div className="editor-toolbar-group" aria-label="Text formatting">
          <ToolbarButton
            label="B"
            title="Bold"
            isActive={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
          <ToolbarButton
            label="I"
            title="Italic"
            isActive={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
          <ToolbarButton
            label="U"
            title="Underline"
            isActive={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          />
          <ToolbarButton
            label="S"
            title="Strike"
            isActive={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          />
          <span className="editor-toolbar-divider" aria-hidden="true" />
          <ToolbarButton
            label="H1"
            title="Heading 1"
            isActive={editor.isActive("heading", { level: 1 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
          />
          <ToolbarButton
            label="H2"
            title="Heading 2"
            isActive={editor.isActive("heading", { level: 2 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          />
          <span className="editor-toolbar-divider" aria-hidden="true" />
          <ToolbarButton
            label="•"
            title="Bullet list"
            isActive={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          />
          <ToolbarButton
            label="1."
            title="Ordered list"
            isActive={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          />
          <ToolbarButton
            label="“”"
            title="Blockquote"
            isActive={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          />
          <span className="editor-toolbar-divider" aria-hidden="true" />
          {alignmentOptions.map((option) => (
            <ToolbarButton
              key={option.value}
              label={option.label}
              title={`Align ${option.value}`}
              isActive={editor.isActive({ textAlign: option.value })}
              onClick={() => editor.chain().focus().setTextAlign(option.value).run()}
            />
          ))}
          <span className="editor-toolbar-divider" aria-hidden="true" />
          <label className="editor-toolbar-color" title="Text color">
            <span className="editor-toolbar-swatch" style={{ backgroundColor: currentTextColor }} />
            <input
              type="color"
              value={currentTextColor}
              onChange={(event) =>
                editor.chain().focus().setTextColor(event.target.value).run()
              }
            />
          </label>
          <label className="editor-toolbar-color" title="Highlight color">
            <span
              className="editor-toolbar-swatch is-highlight"
              style={{ backgroundColor: currentHighlightColor }}
            />
            <input
              type="color"
              value={currentHighlightColor}
              onChange={(event) =>
                editor.chain().focus().setHighlightColor(event.target.value).run()
              }
            />
          </label>
          <select
            className="editor-toolbar-select"
            aria-label="Font family"
            value={currentFontFamily}
            onChange={(event) =>
              (event.target.value === "inherit"
                ? editor.chain().focus().unsetFontFamily()
                : editor.chain().focus().setFontFamily(event.target.value)
              ).run()
            }
          >
            {fontFamilyOptions.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            className="editor-toolbar-select editor-toolbar-select-size"
            aria-label="Font size"
            value={currentFontSize}
            onChange={(event) =>
              (event.target.value === "inherit"
                ? editor.chain().focus().unsetFontSize()
                : editor.chain().focus().setFontSize(event.target.value)
              ).run()
            }
          >
            {fontSizeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </BubbleMenu>
  );
}
