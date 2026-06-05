import { Node, ResizableNodeView, mergeAttributes } from "@tiptap/core";

export interface VaultImageAttrs {
  src: string;
  alt?: string | null;
  title?: string | null;
  width?: number | null;
  height?: number | null;
  align?: "left" | "center" | "right";
  x?: number | null;
  y?: number | null;
}

export interface VaultImageOptions {
  HTMLAttributes: Record<string, unknown>;
  resolveSrc: (relativePath: string) => Promise<string>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    image: {
      setImage: (attrs: VaultImageAttrs) => ReturnType;
      setImageAlignment: (align: "left" | "center" | "right") => ReturnType;
    };
  }
}

function toDomAttributes(attrs: VaultImageAttrs) {
  return {
    src: attrs.src,
    "data-vault-src": attrs.src,
    alt: attrs.alt ?? undefined,
    title: attrs.title ?? undefined,
    width: attrs.width ?? undefined,
    height: attrs.height ?? undefined,
    "data-align": attrs.align ?? "center",
    "data-x": attrs.x ?? undefined,
    "data-y": attrs.y ?? undefined,
    style:
      typeof attrs.x === "number" && typeof attrs.y === "number"
        ? `position: absolute; left: ${attrs.x}px; top: ${attrs.y}px; z-index: 2;`
        : undefined,
  };
}

function getObjectPosition(align: VaultImageAttrs["align"]) {
  switch (align) {
    case "left":
      return "left center";
    case "right":
      return "right center";
    case "center":
    default:
      return "center center";
  }
}

async function applyImageState(
  element: HTMLImageElement,
  attrs: VaultImageAttrs,
  resolveSrc: (relativePath: string) => Promise<string>,
) {
  element.dataset.vaultSrc = attrs.src;
  element.dataset.align = attrs.align ?? "center";
  element.alt = attrs.alt ?? "";

  if (attrs.title) {
    element.title = attrs.title;
  } else {
    element.removeAttribute("title");
  }

  if (typeof attrs.width === "number") {
    element.style.width = `${attrs.width}px`;
    element.width = attrs.width;
  } else {
    element.style.removeProperty("width");
    element.removeAttribute("width");
  }

  if (typeof attrs.height === "number") {
    element.style.height = `${attrs.height}px`;
    element.height = attrs.height;
  } else {
    element.style.removeProperty("height");
    element.removeAttribute("height");
  }

  element.style.objectFit = attrs.width || attrs.height ? "cover" : "contain";
  element.style.objectPosition = getObjectPosition(attrs.align ?? "center");

  try {
    const resolvedSrc = await resolveSrc(attrs.src);
    element.src = resolvedSrc;
  } catch {
    element.removeAttribute("src");
  }
}

export const VaultImage = Node.create<VaultImageOptions>({
  name: "image",

  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      resolveSrc: async (relativePath: string) => relativePath,
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) =>
          element.getAttribute("data-vault-src") ?? element.getAttribute("src"),
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
        parseHTML: (element) => {
          const width = element.getAttribute("width");
          return width ? Number.parseInt(width, 10) : null;
        },
      },
      height: {
        default: null,
        parseHTML: (element) => {
          const height = element.getAttribute("height");
          return height ? Number.parseInt(height, 10) : null;
        },
      },
      align: {
        default: "center",
        parseHTML: (element) =>
          (element.getAttribute("data-align") as VaultImageAttrs["align"]) ?? "center",
      },
      x: {
        default: null,
        parseHTML: (element) => {
          const x = element.getAttribute("data-x");
          return x ? Number.parseInt(x, 10) : null;
        },
      },
      y: {
        default: null,
        parseHTML: (element) => {
          const y = element.getAttribute("data-y");
          return y ? Number.parseInt(y, 10) : null;
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "img[src]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "img",
      mergeAttributes(this.options.HTMLAttributes, toDomAttributes(HTMLAttributes as VaultImageAttrs)),
    ];
  },

  addCommands() {
    return {
      setImage:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs,
          }),
      setImageAlignment:
        (align) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, { align }),
    };
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const image = document.createElement("img");
      let currentNode = node;
      let loadToken = 0;

      image.className = "editor-image";
      image.draggable = false;

      const syncImage = () => {
        loadToken += 1;
        const currentToken = loadToken;

        void applyImageState(
          image,
          currentNode.attrs as VaultImageAttrs,
          async (relativePath) => {
            const url = await this.options.resolveSrc(relativePath);

            if (currentToken !== loadToken) {
              throw new Error("Image load superseded");
            }

            return url;
          },
        );
      };

      syncImage();

      const nodeView = new ResizableNodeView({
        element: image,
        node: currentNode,
        editor,
        getPos,
        onResize: (width, height) => {
          image.style.width = `${Math.round(width)}px`;
          image.style.height = `${Math.round(height)}px`;
        },
        onCommit: (width, height) => {
          const position = getPos();

          if (position === undefined) {
            return;
          }

          editor.commands.command(({ tr }) => {
            tr.setNodeMarkup(position, undefined, {
              ...currentNode.attrs,
              width: Math.round(width),
              height: Math.round(height),
            });

            return true;
          });
        },
        onUpdate: (updatedNode) => {
          if (updatedNode.type !== currentNode.type) {
            return false;
          }

          currentNode = updatedNode;
          syncImage();
          return true;
        },
        options: {
          directions: ["top-left", "top-right", "bottom-left", "bottom-right"],
          min: {
            width: 96,
            height: 64,
          },
          preserveAspectRatio: false,
          className: {
            container: "editor-image-node",
            wrapper: "editor-image-wrapper",
            handle: "editor-image-resize-handle",
            resizing: "is-resizing",
          },
          createCustomHandle: (direction) => {
            const handle = document.createElement("button");
            handle.type = "button";
            handle.tabIndex = -1;
            handle.className = `editor-image-resize-handle is-${direction}`;
            handle.setAttribute("aria-hidden", "true");
            return handle;
          },
        },
      });

      const container = nodeView.dom;
      const wrapper = nodeView.wrapper;
      let dragState:
        | {
            startPointerX: number;
            startPointerY: number;
            startLeft: number;
            startTop: number;
          }
        | null = null;

      const syncFloatingPosition = () => {
        const attrs = currentNode.attrs as VaultImageAttrs;

        if (typeof attrs.x === "number" && typeof attrs.y === "number") {
          container.dataset.floating = "true";
          container.style.position = "absolute";
          container.style.left = `${attrs.x}px`;
          container.style.top = `${attrs.y}px`;
          container.style.zIndex = "2";
          wrapper.style.cursor = "grab";
          wrapper.style.touchAction = "none";
          return;
        }

        delete container.dataset.floating;
        container.style.position = "";
        container.style.left = "";
        container.style.top = "";
        container.style.zIndex = "";
        wrapper.style.cursor = "";
        wrapper.style.touchAction = "";
      };

      const updateFloatingPosition = (left: number, top: number) => {
        container.dataset.floating = "true";
        container.style.position = "absolute";
        container.style.left = `${Math.round(left)}px`;
        container.style.top = `${Math.round(top)}px`;
        container.style.zIndex = "20";
      };

      const commitFloatingPosition = (left: number, top: number) => {
        const position = getPos();

        if (position === undefined) {
          return;
        }

        editor.commands.command(({ tr }) => {
          tr.setNodeMarkup(position, undefined, {
            ...currentNode.attrs,
            x: Math.round(left),
            y: Math.round(top),
          });

          return true;
        });
      };

      const handlePointerDown = (event: PointerEvent) => {
        if (event.button !== 0 || !editor.isEditable) {
          return;
        }

        const target = event.target as HTMLElement | null;

        if (target?.closest(".editor-image-resize-handle")) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        const editorRect = editor.view.dom.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const attrs = currentNode.attrs as VaultImageAttrs;
        const startLeft = typeof attrs.x === "number" ? attrs.x : containerRect.left - editorRect.left;
        const startTop = typeof attrs.y === "number" ? attrs.y : containerRect.top - editorRect.top;

        dragState = {
          startPointerX: event.clientX,
          startPointerY: event.clientY,
          startLeft,
          startTop,
        };

        updateFloatingPosition(startLeft, startTop);

        document.addEventListener("pointermove", handlePointerMove);
        document.addEventListener("pointerup", handlePointerUp);
        document.addEventListener("pointercancel", handlePointerUp);
      };

      const handlePointerMove = (event: PointerEvent) => {
        if (!dragState) {
          return;
        }

        const nextLeft = dragState.startLeft + (event.clientX - dragState.startPointerX);
        const nextTop = dragState.startTop + (event.clientY - dragState.startPointerY);
        updateFloatingPosition(nextLeft, nextTop);
      };

      const handlePointerUp = (event: PointerEvent) => {
        if (!dragState) {
          return;
        }

        const nextLeft = dragState.startLeft + (event.clientX - dragState.startPointerX);
        const nextTop = dragState.startTop + (event.clientY - dragState.startPointerY);

        dragState = null;
        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerup", handlePointerUp);
        document.removeEventListener("pointercancel", handlePointerUp);

        commitFloatingPosition(nextLeft, nextTop);
      };

      wrapper.addEventListener("pointerdown", handlePointerDown);
      syncFloatingPosition();

      return nodeView;
    };
  },
});
