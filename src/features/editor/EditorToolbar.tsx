import type { Editor } from "@tiptap/react";

interface EditorToolbarProps {
  editor: Editor | null;
  onInsertImage: () => void;
  isImportingImage: boolean;
}

export function EditorToolbar({
  editor,
  onInsertImage,
  isImportingImage,
}: EditorToolbarProps) {
  return (
    <div className="editor-static-toolbar">
      <div className="editor-static-toolbar-main">
        <button
          type="button"
          className="editor-static-toolbar-button"
          onClick={onInsertImage}
          disabled={isImportingImage}
        >
          {isImportingImage ? "Importing..." : "Insert Image"}
        </button>

        {editor ? (
          <div className="editor-paragraph-toolbar" aria-label="Paragraph alignment">
            <span className="editor-toolbar-label">Paragraph</span>
            {(["left", "center", "right", "justify"] as const).map((alignment) => (
              <button
                key={alignment}
                type="button"
                className={`editor-static-toolbar-button${editor.isActive({ textAlign: alignment }) ? " is-active" : ""}`}
                onMouseDown={(event) => {
                  event.preventDefault();
                }}
                onClick={() => editor.chain().focus().setTextAlign(alignment).run()}
              >
                {alignment === "justify" ? "J" : alignment[0].toUpperCase()}
              </button>
            ))}
          </div>
        ) : null}
      </div>

    </div>
  );
}
