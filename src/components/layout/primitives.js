import { cn } from "@/lib/utils";

export function Page({ children, className }) {
  return <div className={cn("w-full", className)}>{children}</div>;
}

export function PageHeader({ children, className }) {
  return <header className={cn("w-full", className)}>{children}</header>;
}

export function PageContent({ children, className }) {
  return <div className={cn("w-full", className)}>{children}</div>;
}

export function Section({ children, className }) {
  return <section className={cn("w-full", className)}>{children}</section>;
}

export function SectionHeader({ children, className }) {
  return <div className={cn("flex items-center justify-between gap-4", className)}>{children}</div>;
}

export function Stack({ children, className }) {
  return <div className={cn("flex flex-col gap-4", className)}>{children}</div>;
}

export function Inline({ children, className }) {
  return <div className={cn("flex items-center gap-3", className)}>{children}</div>;
}

export function Container({ children, className }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6", className)}>{children}</div>;
}
