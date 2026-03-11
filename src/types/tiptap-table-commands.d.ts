import "@tiptap/core";

declare module "@tiptap/core" {
  interface ChainedCommands {
    insertTable: (options: { rows: number; cols: number; withHeaderRow?: boolean }) => this;
    addRowBefore: () => this;
    addRowAfter: () => this;
    addColumnBefore: () => this;
    addColumnAfter: () => this;
    deleteRow: () => this;
    deleteColumn: () => this;
    deleteTable: () => this;
    toggleHeaderRow: () => this;
  }
}
