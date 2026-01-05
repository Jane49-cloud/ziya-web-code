import { Mark, mergeAttributes } from "@tiptap/core";
import type { ChainedCommands, Editor } from "@tiptap/core";

export interface DocumentTextStyleOptions {
  HTMLAttributes: Record<string, string>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    documentTextStyle: {
      setTextColor: (color: string) => ReturnType;
      unsetTextColor: () => ReturnType;
      setHighlightColor: (color: string) => ReturnType;
      unsetHighlightColor: () => ReturnType;
      clearTextStyle: () => ReturnType;
    };
  }
}

export const DocumentTextStyle = Mark.create<DocumentTextStyleOptions>({
  name: "textStyle",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          const el = element;
          return el.style?.color || null;
        },
        renderHTML: (attributes: { color?: string | null }) => {
          if (!attributes.color) {
            return {};
          }
          return {
            style: `color: ${attributes.color}`,
          };
        },
      },
      backgroundColor: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          const el = element;
          return el.style?.backgroundColor || null;
        },
        renderHTML: (attributes: { backgroundColor?: string | null }) => {
          if (!attributes.backgroundColor) {
            return {};
          }
          return {
            style: `background-color: ${attributes.backgroundColor}`,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span",
        getAttrs: (element: HTMLElement) => {
          const el = element;
          const hasStyle = el.style?.color || el.style?.backgroundColor;
          return hasStyle ? {} : false;
        },
      },
    ];
  },

  renderHTML({
    HTMLAttributes,
  }: {
    HTMLAttributes: Record<string, string>;
  }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },

  addCommands() {
    const applyStyle = (style: Record<string, string | null>) => {
      return ({
        chain,
        editor,
      }: {
        chain: () => ChainedCommands;
        editor: Editor;
      }) => {
        const current = editor.getAttributes(this.name) || {};
        const next = { ...current } as Record<string, string>;

        Object.entries(style).forEach(([key, value]) => {
          if (!value) {
            delete next[key];
          } else {
            next[key] = value;
          }
        });

        if (Object.keys(next).length === 0) {
          return chain().unsetMark(this.name).run();
        }

        return chain().setMark(this.name, next).run();
      };
    };

    return {
      setTextColor: (color: string) => applyStyle({ color }),
      unsetTextColor: () => applyStyle({ color: null }),
      setHighlightColor: (color: string) =>
        applyStyle({ backgroundColor: color }),
      unsetHighlightColor: () => applyStyle({ backgroundColor: null }),
      clearTextStyle: () =>
        ({ chain }: { chain: () => ChainedCommands }) =>
          chain().unsetMark(this.name).run(),
    };
  },
});
