import { Extension } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    textAlign: {
      setTextAlign: (alignment: "left" | "center" | "right" | "justify") => ReturnType;
      unsetTextAlign: () => ReturnType;
    };
  }
}

export const TextAlign = Extension.create({
  name: "textAlign",

  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading", "blockquote"],
        attributes: {
          textAlign: {
            default: null,
            parseHTML: (element: HTMLElement) =>
              element.style.textAlign || null,
            renderHTML: (attributes: Record<string, unknown>) => {
              if (!attributes.textAlign) {
                return {};
              }

              return {
                style: `text-align: ${attributes.textAlign}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setTextAlign:
        (alignment) =>
        ({ commands }) =>
          commands.updateAttributes("paragraph", { textAlign: alignment }) &&
          commands.updateAttributes("heading", { textAlign: alignment }) &&
          commands.updateAttributes("blockquote", { textAlign: alignment }),
      unsetTextAlign:
        () =>
        ({ commands }) =>
          commands.updateAttributes("paragraph", { textAlign: null }) &&
          commands.updateAttributes("heading", { textAlign: null }) &&
          commands.updateAttributes("blockquote", { textAlign: null }),
    };
  },
});
