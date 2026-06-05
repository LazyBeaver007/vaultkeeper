import { EditorContent, useEditor } from "@tiptap/react";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef, useState } from "react";
import { FloatingToolbar } from "./FloatingToolbar";
import { EditorToolbar } from "./EditorToolbar";
import { InlineStyle } from "./extensions/InlineStyle";
import { TextAlign } from "./extensions/TextAlign";
import { VaultImage } from "./extensions/VaultImage";
import { Wikilink } from "./extensions/Wikilink";
import { convertWikilinks } from "../../utils/convertWikilinks";
import { serializeWikilinks } from "../../utils/serializeWikilinks";
import {
  importImageFromFile,
  isSupportedImageFileName,
  isSupportedImageMimeType,
  loadVaultImageUrl,
  pickAndImportImage,
  type ImportedImageAsset,
} from "./imageAssetService";

interface Props {
  pageId: string;
  vaultPath: string;
  content: string;
  onChange: (html: string) => void;
  onLinkClick?: (page: string) => void;
}

export function Editor({ pageId, vaultPath, content, onChange, onLinkClick }: Props) {
  const lastEmittedContent = useRef("");
  const [isImportingImage, setIsImportingImage] = useState(false);

  function toEditorContent(value: string) {
    return convertWikilinks(serializeWikilinks(value));
  }

  function insertImportedImages(images: ImportedImageAsset[], position?: number) {
    if (!images.length) {
      return;
    }

    if (!editor) {
      return;
    }

    const htmlToInsert = images
      .map(
        (image) =>
          `<p></p><img src="${image.relativePath}" data-vault-src="${image.relativePath}" data-align="center" /><p></p>`,
      )
      .join("");

    typeof position === "number"
      ? editor.chain().focus().insertContentAt(position, htmlToInsert).run()
      : editor.chain().focus().insertContent(htmlToInsert).run();
  }

  async function handleInsertImage() {
    setIsImportingImage(true);

    try {
      const image = await pickAndImportImage(vaultPath);

      if (image) {
        insertImportedImages([image]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsImportingImage(false);
    }
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
      VaultImage.configure({
        resolveSrc: (relativePath) => loadVaultImageUrl(vaultPath, relativePath),
      }),
    ],
    editorProps: {
      attributes: {
        class: "editor-content",
      },
      handleDrop: (_view, event) => {
        const files = Array.from(event.dataTransfer?.files ?? []);
        const imageFiles = files.filter(
          (file) =>
            isSupportedImageMimeType(file.type) ||
            isSupportedImageFileName(file.name),
        );

        if (!imageFiles.length) {
          return false;
        }

        const position = editor?.view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        })?.pos;

        setIsImportingImage(true);

        void Promise.all(imageFiles.map((file) => importImageFromFile(vaultPath, file)))
          .then((images) => {
            insertImportedImages(images, position);
          })
          .catch((error) => {
            console.error(error);
          })
          .finally(() => {
            setIsImportingImage(false);
          });

        return true;
      },
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files ?? []);
        const imageFiles = files.filter(
          (file) =>
            isSupportedImageMimeType(file.type) ||
            isSupportedImageFileName(file.name),
        );

        if (!imageFiles.length) {
          return false;
        }

        setIsImportingImage(true);

        void Promise.all(imageFiles.map((file) => importImageFromFile(vaultPath, file)))
          .then((images) => {
            insertImportedImages(images);
          })
          .catch((error) => {
            console.error(error);
          })
          .finally(() => {
            setIsImportingImage(false);
          });

        return true;
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
      <EditorToolbar
        editor={editor}
        onInsertImage={handleInsertImage}
        isImportingImage={isImportingImage}
      />
      <FloatingToolbar editor={editor} />
      <div className="editor-frame">
        <EditorContent editor={editor} />
      </div>
    </section>
  );
}
