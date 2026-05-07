import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { Wikilink } from "./extensions/Wikilink";
import { convertWikilinks } from "../../utils/convertWikilinks";

interface Props {
  content: string;
  onChange: (html: string) => void;
  onLinkClick?: (page: string) => void;
}

export function Editor({ content, onChange, onLinkClick }: Props) {
  const editor = useEditor({
    extensions: [StarterKit, Wikilink],
    content,
    onUpdate: ({ editor }) => {
      const html = convertWikilinks(editor.getHTML());
      onChange(html);
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content]);

  useEffect(() => {
    if (!editor) return;

    const dom = editor.view.dom;

    function handleClick(e: Event) {
      const target = e.target as HTMLElement;

      if (target.dataset.page && onLinkClick) {
        onLinkClick(target.dataset.page);
      }
    }

    dom.addEventListener("click", handleClick);

    return () => {
      dom.removeEventListener("click", handleClick);
    };
  }, [editor]);

  if (!editor) return null;

  return <EditorContent editor={editor} />;
}
