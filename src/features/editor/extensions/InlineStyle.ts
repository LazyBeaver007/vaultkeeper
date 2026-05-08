import { Mark, mergeAttributes } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    inlineStyle: {
      setTextColor: (color: string) => ReturnType;
      unsetTextColor: () => ReturnType;
      setHighlightColor: (color: string) => ReturnType;
      unsetHighlightColor: () => ReturnType;
      setFontFamily: (fontFamily: string) => ReturnType;
      unsetFontFamily: () => ReturnType;
      setFontSize: (fontSize: string) => ReturnType;
      unsetFontSize: () => ReturnType;
      removeEmptyTextStyle: () => ReturnType;
    };
  }
}

function buildStyle(attributes: Record<string, unknown>) {
  const style = [
    attributes.color ? `color: ${attributes.color}` : "",
    attributes.backgroundColor ? `background-color: ${attributes.backgroundColor}` : "",
    attributes.fontFamily ? `font-family: ${attributes.fontFamily}` : "",
    attributes.fontSize ? `font-size: ${attributes.fontSize}` : "",
  ]
    .filter(Boolean)
    .join("; ");

  return style || null;
}

function parseStyle(element: HTMLElement, propertyName: string) {
  const value = element.style.getPropertyValue(propertyName);
  return value || null;
}

function updateTextStyleAttribute(
  attrs: Record<string, string | null>,
) {
  return ({ chain }: { chain: () => any }) =>
    chain().setMark("textStyle", attrs).removeEmptyTextStyle().run();
}

export const InlineStyle = Mark.create({
  name: "textStyle",
  priority: 101,
  inclusive: true,
  group: "inline",
  spanning: true,

  parseHTML() {
    return [{ tag: "span" }];
  },

  renderHTML({ HTMLAttributes }) {
    const style = buildStyle(HTMLAttributes);

    if (!style) {
      return ["span", mergeAttributes(HTMLAttributes), 0];
    }

    return ["span", mergeAttributes(HTMLAttributes, { style }), 0];
  },

  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element: HTMLElement) => parseStyle(element, "color"),
      },
      backgroundColor: {
        default: null,
        parseHTML: (element: HTMLElement) =>
          parseStyle(element, "background-color"),
      },
      fontFamily: {
        default: null,
        parseHTML: (element: HTMLElement) =>
          parseStyle(element, "font-family"),
      },
      fontSize: {
        default: null,
        parseHTML: (element: HTMLElement) => parseStyle(element, "font-size"),
      },
    };
  },

  addCommands() {
    return {
      setTextColor:
        (color: string) =>
        ({ chain }) =>
          updateTextStyleAttribute({ color })( { chain } ),
      unsetTextColor:
        () =>
        ({ chain }) =>
          updateTextStyleAttribute({ color: null })({ chain }),
      setHighlightColor:
        (backgroundColor: string) =>
        ({ chain }) =>
          updateTextStyleAttribute({ backgroundColor })({ chain }),
      unsetHighlightColor:
        () =>
        ({ chain }) =>
          updateTextStyleAttribute({ backgroundColor: null })({ chain }),
      setFontFamily:
        (fontFamily: string) =>
        ({ chain }) =>
          updateTextStyleAttribute({ fontFamily })({ chain }),
      unsetFontFamily:
        () =>
        ({ chain }) =>
          updateTextStyleAttribute({ fontFamily: null })({ chain }),
      setFontSize:
        (fontSize: string) =>
        ({ chain }) =>
          updateTextStyleAttribute({ fontSize })({ chain }),
      unsetFontSize:
        () =>
        ({ chain }) =>
          updateTextStyleAttribute({ fontSize: null })({ chain }),
      removeEmptyTextStyle:
        () =>
        ({ state, tr, dispatch }) => {
          state.doc.descendants((node, pos) => {
            if (!node.isText) {
              return true;
            }

            node.marks.forEach((mark) => {
              if (mark.type.name !== "textStyle") {
                return;
              }

              const hasStyling = Object.values(mark.attrs).some(Boolean);

              if (!hasStyling) {
                tr.removeMark(pos, pos + node.nodeSize, mark.type);
              }
            });

            return true;
          });

          if (dispatch) {
            dispatch(tr);
          }

          return true;
        },
    };
  },
});
