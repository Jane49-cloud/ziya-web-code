export type TKeenIconsStyle = "duotone" | "filled" | "solid" | "outline";

export interface IKeenIconsProps {
  icon: string;
  style?: TKeenIconsStyle;
  className?: string;
}

declare module "@tiptap/extension-table";
