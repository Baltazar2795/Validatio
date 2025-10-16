import React from "react";

export default function FilesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Можешь убрать стиль — он тут просто как обёртка
  return <section style={{ padding: 24 }}>{children}</section>;
}
