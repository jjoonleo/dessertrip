import type { ReactNode } from "react";

type FormFieldProps = {
  children: ReactNode;
  className?: string;
  label: ReactNode;
};

type FormStackProps = {
  children: ReactNode;
  className?: string;
};

export function FormField({ children, className, label }: FormFieldProps) {
  const classes = ["form-control", "w-full", "gap-2", className]
    .filter(Boolean)
    .join(" ");

  return (
    <label className={classes}>
      <span className="label-text font-medium">{label}</span>
      {children}
    </label>
  );
}

export function FormStack({ children, className }: FormStackProps) {
  const classes = ["flex", "flex-col", "gap-5", className].filter(Boolean).join(" ");

  return <div className={classes}>{children}</div>;
}
