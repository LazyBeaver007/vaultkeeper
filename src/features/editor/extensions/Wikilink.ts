import { Mark, mergeAttributes } from "@tiptap/core";

export const Wikilink = Mark.create({
  name: "wikilink",

  inclusive: false,

  addAttributes() {
    return {
      page: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-wikilink]",
        getAttrs: (element) => ({
          page: (element as HTMLElement).getAttribute("data-page"),
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-wikilink": "",
        "data-page": HTMLAttributes.page,
        class: "wikilink",
      }),
      0,
    ];
  },
})
