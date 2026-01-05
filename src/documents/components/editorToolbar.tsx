import React, { useEffect, useState } from "react";
import { Button, Tooltip, Popover, Dropdown } from "antd";
import type { MenuProps } from "antd";
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  UndoOutlined,
  RedoOutlined,
  LinkOutlined,
  ClearOutlined,
  MinusOutlined,
  PictureOutlined,
  FontColorsOutlined,
  BgColorsOutlined,
  TableOutlined,
  InsertRowAboveOutlined,
  InsertRowBelowOutlined,
  InsertRowLeftOutlined,
  InsertRowRightOutlined,
  ColumnWidthOutlined,
  ColumnHeightOutlined,
} from "@ant-design/icons";
import type { Editor } from "@tiptap/core";
import { Quote } from "lucide-react";
import clsx from "clsx";

const TEXT_COLORS = [
  "#0f172a",
  "#ef4444",
  "#f97316",
  "#facc15",
  "#22c55e",
  "#0ea5e9",
  "#a855f7",
  "#ec4899",
];

const HIGHLIGHT_COLORS = [
  "#fef3c7",
  "#d9f99d",
  "#bfdbfe",
  "#fecdd3",
  "#fde68a",
  "#c4b5fd",
];

type TableAction =
  | "insert"
  | "add-row-above"
  | "add-row-below"
  | "add-col-left"
  | "add-col-right"
  | "delete-row"
  | "delete-col"
  | "delete-table"
  | "toggle-header";

const tableLabel = (icon: React.ReactNode, text: string) => (
  <span className="flex items-center gap-2 text-gray-700">
    {icon}
    <span>{text}</span>
  </span>
);

const ToolbarDivider = () => (
  <span className="mx-1 h-6 w-px bg-slate-200" aria-hidden="true" />
);

interface ToolbarButtonProps {
  label: string;
  isActive?: boolean;
  iconOnly?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
  onMouseDown?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}

const toolbarButtonClass = ({
  isActive,
  iconOnly,
  disabled,
}: {
  isActive?: boolean;
  iconOnly?: boolean;
  disabled?: boolean;
}) =>
  clsx(
    "toolbar-btn inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
    iconOnly ? "h-8 w-8" : "h-8 px-3",
    isActive
      ? "bg-primary/10 text-primary shadow-sm"
      : "text-slate-600 hover:bg-slate-100",
    disabled && "cursor-not-allowed opacity-50 hover:bg-transparent",
  );

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  label,
  children,
  isActive,
  iconOnly,
  disabled,
  style,
  onMouseDown,
}) => (
  <Tooltip title={label}>
    <span className="inline-flex">
      <button
        type="button"
        className={toolbarButtonClass({ isActive, iconOnly, disabled })}
        onMouseDown={(event) => {
          if (disabled) {
            event.preventDefault();
            return;
          }
          onMouseDown?.(event);
        }}
        style={style}
        disabled={disabled}
      >
        {children}
      </button>
    </span>
  </Tooltip>
);

interface EditorToolbarProps {
  editor: Editor | null;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
  const [, forceRender] = useState(0);

  useEffect(() => {
    if (!editor) return;

    const rerender = () => forceRender((prev) => prev + 1);
    const events: Array<Parameters<typeof editor.on>[0]> = [
      "selectionUpdate",
      "transaction",
      "update",
    ];

    events.forEach((event) => editor.on(event, rerender));

    return () => {
      events.forEach((event) => editor.off(event, rerender));
    };
  }, [editor]);

  if (!editor) return null;

  const textStyleAttributes = editor.getAttributes("textStyle") || {};
  const activeTextColor = (textStyleAttributes.color as string) || null;
  const activeHighlightColor =
    (textStyleAttributes.backgroundColor as string) || null;

  const run = (command: () => void) => (event: React.MouseEvent) => {
    event.preventDefault();
    command();
  };

  const addLink = () => {
    const previous = (editor.getAttributes("link")?.href as string) || "";
    const url = window.prompt("Enter URL", previous || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt("Image URL");
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  };

  const handleColorSelect = (color: string) => {
    editor.chain().focus().setTextColor(color).run();
  };

  const handleHighlightSelect = (color: string) => {
    editor.chain().focus().setHighlightColor(color).run();
  };

  const clearFormatting = () => {
    editor
      .chain()
      .focus()
      .unsetAllMarks()
      .clearNodes()
      .clearTextStyle()
      .run();
  };

  const promptForNumber = (label: string, fallback: number) => {
    const value = window.prompt(label, String(fallback));
    if (!value) return fallback;
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) || parsed <= 0 ? fallback : parsed;
  };

  const handleTableAction = (action: TableAction) => {
    switch (action) {
      case "insert": {
        const rows = promptForNumber("Rows", 3);
        const cols = promptForNumber("Columns", 3);
        editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
        return;
      }
      case "add-row-above":
        editor.chain().focus().addRowBefore().run();
        return;
      case "add-row-below":
        editor.chain().focus().addRowAfter().run();
        return;
      case "add-col-left":
        editor.chain().focus().addColumnBefore().run();
        return;
      case "add-col-right":
        editor.chain().focus().addColumnAfter().run();
        return;
      case "delete-row":
        editor.chain().focus().deleteRow().run();
        return;
      case "delete-col":
        editor.chain().focus().deleteColumn().run();
        return;
      case "delete-table":
        editor.chain().focus().deleteTable().run();
        return;
      case "toggle-header":
        editor.chain().focus().toggleHeaderRow().run();
        return;
    }
  };

  const disableTableActions = !editor.isActive("table");
  const tableMenuItems: MenuProps["items"] = [
    {
      key: "insert",
      label: tableLabel(<TableOutlined />, "Insert table"),
    },
    { type: "divider" },
    {
      key: "add-row-above",
      label: tableLabel(<InsertRowAboveOutlined />, "Insert row above"),
      disabled: disableTableActions,
    },
    {
      key: "add-row-below",
      label: tableLabel(<InsertRowBelowOutlined />, "Insert row below"),
      disabled: disableTableActions,
    },
    {
      key: "add-col-left",
      label: tableLabel(<InsertRowLeftOutlined />, "Insert column left"),
      disabled: disableTableActions,
    },
    {
      key: "add-col-right",
      label: tableLabel(<InsertRowRightOutlined />, "Insert column right"),
      disabled: disableTableActions,
    },
    {
      key: "delete-row",
      label: tableLabel(<ColumnHeightOutlined />, "Delete row"),
      disabled: disableTableActions,
    },
    {
      key: "delete-col",
      label: tableLabel(<ColumnWidthOutlined />, "Delete column"),
      disabled: disableTableActions,
    },
    {
      key: "delete-table",
      label: tableLabel(<ClearOutlined />, "Delete table"),
      disabled: disableTableActions,
    },
    {
      key: "toggle-header",
      label: tableLabel(<Quote size={16} />, "Toggle header row"),
      disabled: disableTableActions,
    },
  ];

  const renderColorPalette = (
    colors: string[],
    onSelect: (color: string) => void,
    onClear: () => void,
  ) => (
    <div className="w-48 p-1">
      <div className="mb-2 flex flex-wrap gap-2">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            className="h-6 w-6 rounded-full border border-slate-200 focus:outline-none hover:border-slate-400"
            style={{ background: color }}
            onMouseDown={(event) => {
              event.preventDefault();
              onSelect(color);
            }}
          />
        ))}
      </div>
      <Button
        size="small"
        block
        onMouseDown={(event) => {
          event.preventDefault();
          onClear();
        }}
      >
        Clear
      </Button>
    </div>
  );

  return (
    <div className="flex flex-wrap items-center gap-1">
      <ToolbarButton
        label="Bold"
        iconOnly
        isActive={editor.isActive("bold")}
        onMouseDown={run(() => editor.chain().focus().toggleBold().run())}
      >
        <BoldOutlined />
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        iconOnly
        isActive={editor.isActive("italic")}
        onMouseDown={run(() => editor.chain().focus().toggleItalic().run())}
      >
        <ItalicOutlined />
      </ToolbarButton>
      <ToolbarButton
        label="Underline"
        iconOnly
        isActive={editor.isActive("underline")}
        onMouseDown={run(() => editor.chain().focus().toggleUnderline().run())}
      >
        <UnderlineOutlined />
      </ToolbarButton>
      <ToolbarButton
        label="Strike"
        iconOnly
        isActive={editor.isActive("strike")}
        onMouseDown={run(() => editor.chain().focus().toggleStrike().run())}
      >
        <StrikethroughOutlined />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        label="Paragraph"
        isActive={editor.isActive("paragraph")}
        onMouseDown={run(() => editor.chain().focus().setParagraph().run())}
      >
        P
      </ToolbarButton>
      {([1, 2, 3] as const).map((level) => (
        <ToolbarButton
          key={level}
          label={`Heading ${level}`}
          isActive={editor.isActive("heading", { level })}
          onMouseDown={run(() =>
            editor.chain().focus().toggleHeading({ level }).run(),
          )}
        >
          H{level}
        </ToolbarButton>
      ))}

      <ToolbarDivider />

      <ToolbarButton
        label="Bullet list"
        iconOnly
        isActive={editor.isActive("bulletList")}
        onMouseDown={run(() => editor.chain().focus().toggleBulletList().run())}
      >
        <UnorderedListOutlined />
      </ToolbarButton>
      <ToolbarButton
        label="Numbered list"
        iconOnly
        isActive={editor.isActive("orderedList")}
        onMouseDown={run(() => editor.chain().focus().toggleOrderedList().run())}
      >
        <OrderedListOutlined />
      </ToolbarButton>
      <ToolbarButton
        label="Blockquote"
        iconOnly
        isActive={editor.isActive("blockquote")}
        onMouseDown={run(() => editor.chain().focus().toggleBlockquote().run())}
      >
        <Quote size={16} />
      </ToolbarButton>
      <ToolbarButton
        label="Horizontal rule"
        iconOnly
        onMouseDown={run(() => editor.chain().focus().setHorizontalRule().run())}
      >
        <MinusOutlined />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        label="Align left"
        iconOnly
        isActive={editor.isActive({ textAlign: "left" })}
        onMouseDown={run(() => editor.chain().focus().setTextAlign("left").run())}
      >
        <AlignLeftOutlined />
      </ToolbarButton>
      <ToolbarButton
        label="Align center"
        iconOnly
        isActive={editor.isActive({ textAlign: "center" })}
        onMouseDown={run(() => editor.chain().focus().setTextAlign("center").run())}
      >
        <AlignCenterOutlined />
      </ToolbarButton>
      <ToolbarButton
        label="Align right"
        iconOnly
        isActive={editor.isActive({ textAlign: "right" })}
        onMouseDown={run(() => editor.chain().focus().setTextAlign("right").run())}
      >
        <AlignRightOutlined />
      </ToolbarButton>

      <ToolbarDivider />

      <Popover
        trigger="click"
        content={renderColorPalette(
          TEXT_COLORS,
          handleColorSelect,
          () => editor.chain().focus().unsetTextColor().run(),
        )}
      >
        <span>
          <ToolbarButton
            label="Text color"
            iconOnly
            style={{ color: activeTextColor || undefined }}
            onMouseDown={(event) => event.preventDefault()}
          >
            <FontColorsOutlined />
          </ToolbarButton>
        </span>
      </Popover>

      <Popover
        trigger="click"
        content={renderColorPalette(
          HIGHLIGHT_COLORS,
          handleHighlightSelect,
          () => editor.chain().focus().unsetHighlightColor().run(),
        )}
      >
        <span>
          <ToolbarButton
            label="Highlight"
            iconOnly
            style={{
              background: activeHighlightColor || undefined,
              color: activeHighlightColor ? "#0f172a" : undefined,
            }}
            onMouseDown={(event) => event.preventDefault()}
          >
            <BgColorsOutlined />
          </ToolbarButton>
        </span>
      </Popover>
      <ToolbarButton
        label="Clear formatting"
        iconOnly
        onMouseDown={run(clearFormatting)}
      >
        <ClearOutlined />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        label="Add link"
        iconOnly
        isActive={editor.isActive("link")}
        onMouseDown={run(addLink)}
      >
        <LinkOutlined />
      </ToolbarButton>
      <ToolbarButton
        label="Insert image"
        iconOnly
        onMouseDown={run(addImage)}
      >
        <PictureOutlined />
      </ToolbarButton>
      <Dropdown
        trigger={["click"]}
        menu={{
          items: tableMenuItems,
          onClick: ({ key }) => handleTableAction(key as TableAction),
        }}
      >
        <span>
          <ToolbarButton
            label="Table tools"
            iconOnly
            onMouseDown={(event) => event.preventDefault()}
          >
            <TableOutlined />
          </ToolbarButton>
        </span>
      </Dropdown>

      <ToolbarDivider />

      <ToolbarButton
        label="Undo"
        iconOnly
        onMouseDown={run(() => editor.chain().focus().undo().run())}
        disabled={!editor.can().undo()}
      >
        <UndoOutlined />
      </ToolbarButton>
      <ToolbarButton
        label="Redo"
        iconOnly
        onMouseDown={run(() => editor.chain().focus().redo().run())}
        disabled={!editor.can().redo()}
      >
        <RedoOutlined />
      </ToolbarButton>
    </div>
  );
};
