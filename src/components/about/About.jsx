"use client";

export default function About() {
  return (
    <article className="space-y-8">
      <header>
        <h2 className="text-2xl font-semibold tracking-tight">About</h2>
      </header>

      <div className="space-y-4">
        <p className="text-muted-foreground">
          Citizen Action is a documentation platform under the Mumbai
          Sustainability Center.
        </p>

        <div className="space-y-1 text-sm text-muted-foreground">
          <p>Version 1.0.0</p>

          <p>© {new Date().getFullYear()} Mumbai Sustainability Center</p>
        </div>
      </div>
    </article>
  );
}
