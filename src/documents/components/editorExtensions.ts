import type { AnyExtension } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import { DocumentTextStyle } from "../extensions/textStyle";

/**
 * Shared TipTap extension preset used by the document create/edit forms.
 * Avoids duplicate core extensions and keeps block-level commands (headings/lists/undo)
 * wired in the same way as the Blog editor.
 */
export const buildDocumentEditorExtensions = (
  placeholder: string,
): AnyExtension[] => {
  return [
    DocumentTextStyle,
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      bulletList: { keepMarks: true, keepAttributes: true },
      orderedList: { keepMarks: true, keepAttributes: true },
      undoRedo: { depth: 200 },
      link: false,
      underline: false,
    }),
    Underline,
    TextAlign.configure({
      types: ["heading", "paragraph", "tableHeader", "tableCell"],
    }),
    Table.configure({
      resizable: true,
      allowTableNodeSelection: true,
      HTMLAttributes: { class: "doc-table" },
    }),
    TableRow.configure({
      HTMLAttributes: { class: "doc-table-row" },
    }),
    TableHeader.configure({
      HTMLAttributes: { class: "doc-table-header" },
    }),
    TableCell.configure({
      HTMLAttributes: { class: "doc-table-cell" },
    }),
    Image.configure({
      inline: false,
      allowBase64: true,
      HTMLAttributes: { class: "doc-image" },
    }),
    Link.configure({
      openOnClick: false,
      autolink: true,
      HTMLAttributes: { class: "doc-link" },
    }),
    Placeholder.configure({ placeholder }),
  ];
};
