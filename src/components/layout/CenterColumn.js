"use client";

export default function CenterColumn({ children }) {
  return (
    <main className="flex w-full min-w-0 flex-1 justify-center">
      {children}
    </main>
  );
}
