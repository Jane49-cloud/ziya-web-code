import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { KeenIcon } from "./keenIcons/KeenIcon";

interface IAlertProps {
  variant?: "success" | "info" | "danger" | "primary" | "warning" | "";
  icon?: string;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<string, string> = {
  success: "bg-green-50 border-green-200 text-green-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
  danger: "bg-red-50 border-red-200 text-red-800",
  primary: "bg-indigo-50 border-indigo-200 text-indigo-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
};

export const Alert: React.FC<IAlertProps> = ({
  variant = "primary",
  icon = "information-2",
  children,
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const styles = variantStyles[variant] || variantStyles.primary;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;
  return (
    <div
      role="alert"
      className={clsx(
        "flex items-center gap-2.5 rounded border p-3",
        styles,
        className
      )}
    >
      {/* Icon on the left */}
      <KeenIcon icon={icon} style="solid" className="text-lg leading-none" />

      {/* Alert text */}
      <div className="text-sm">{children}</div>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="ml-3 text-lg text-gray-600 hover:text-gray-800"
        aria-label="Close alert"
      >
        <KeenIcon icon="x" style="solid" />
      </button>
    </div>
  );
};
