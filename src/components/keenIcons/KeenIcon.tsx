import { forwardRef } from "react";
import clsx from "clsx";
import { IKeenIconsProps } from "../@types/common";

export const KeenIcon = forwardRef<HTMLElement, IKeenIconsProps>(
  ({ icon, style = "solid", className = "", ...props }, ref) => {
    return (
      <i
        ref={ref}
        {...props}
        className={clsx(`ki-${style}`, `ki-${icon}`, className)}
      />
    );
  }
);
