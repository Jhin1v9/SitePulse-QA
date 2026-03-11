import type { ReactNode } from "react";

interface CalloutPanelProps {
  children: ReactNode;
  className?: string;
}

export function CalloutPanel({ children, className }: CalloutPanelProps) {
  const panelClassName = className
    ? `panel min-w-0 p-6 sm:p-7 ${className}`
    : "panel min-w-0 p-6 sm:p-7";

  return <div className={panelClassName}>{children}</div>;
}
