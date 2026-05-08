import { EditorContent, useEditor } from "@tiptap/react";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef } from "react";
import { FloatingToolbar } from "./FloatingToolbar";
import { InlineStyle } from "./extensions/InlineStyle";
import { TextAlign } from "./extensions/TextAlign";
import { Wikilink } from "./extensions/Wikilink";
import { convertWikilinks } from "../../utils/convertWikilinks";
import { serializeWikilinks } from "../../utils/serializeWikilinks";

interface Props {
  pageId: string;
  content: string;
  onChange: (html: string) => void;
  onLinkClick?: (page: string) => void;
}

export function Editor({ pageId, content, onChange, onLinkClick }: Props) {
  const lastEmittedContent = useRef("");

  function toEditorContent(value: string) {
    return convertWikilinks(serializeWikilinks(value));
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },
      }),
      Underline,
      InlineStyle,
      TextAlign,
      Wikilink,
    ],
    editorProps: {
      attributes: {
        class: "editor-content",
      },
    },
    content: toEditorContent(content),
    onUpdate: ({ editor }) => {
      const html = serializeWikilinks(editor.getHTML());
      lastEmittedContent.current = html;
      onChange(html);
    },
  });

  useEffect(() => {
    lastEmittedContent.current = "";
  }, [pageId]);

  useEffect(() => {
    if (!editor) return;

    if (content === lastEmittedContent.current) {
      return;
    }

    const nextContent = toEditorContent(content);

    if (nextContent !== editor.getHTML()) {
      editor.commands.setContent(nextContent, { emitUpdate: false });
    }
  }, [content, editor]);

  useEffect(() => {
    if (!editor) return;

    const dom = editor.view.dom;

    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      const wikilink = target?.closest("[data-page]") as HTMLElement | null;

      if (!wikilink?.dataset.page || !onLinkClick) {
        return;
      }

      // Only follow wikilinks on explicit modifier-click so editing text
      // doesn't accidentally switch the active page.
      if (!(e.ctrlKey || e.metaKey)) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      onLinkClick(wikilink.dataset.page);
    }

    function handleAuxClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      const wikilink = target?.closest("[data-page]") as HTMLElement | null;

      if (e.button === 1 && wikilink?.dataset.page && onLinkClick) {
        e.preventDefault();
        e.stopPropagation();
        onLinkClick(wikilink.dataset.page);
      }
    }

    dom.addEventListener("click", handleClick);
    dom.addEventListener("auxclick", handleAuxClick);

    return () => {
      dom.removeEventListener("click", handleClick);
      dom.removeEventListener("auxclick", handleAuxClick);
    };
  }, [editor, onLinkClick]);

  if (!editor) return null;

  return (
    <section className="editor-shell">
      <FloatingToolbar editor={editor} />
      <div className="editor-frame">
        <EditorContent editor={editor} />
      </div>
    </section>
  );
}
