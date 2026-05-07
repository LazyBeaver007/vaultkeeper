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
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-wikilink": "",
        class: "wikilink",
      }),
      0,
    ];
  },
})
