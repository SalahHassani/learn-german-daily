import * as React from "react";

export function Divider({ className = "" }: { className?: string }) {
  return <hr className={`my-6 border-0 border-t border-[var(--border-subtle)] ${className}`} />;
}