"use client";

export default function About() {
  return (
    <article className="space-y-8">
      <header>
        <h2 className="text-2xl font-semibold tracking-tight">About Citizen Action</h2>
      </header>

      <div className="space-y-4">
        <p className="text-muted-foreground">
          Citizen Action is an independent civic participation and documentation
          platform. It helps people organize around shared issues and places,
          contribute useful information, and explore public organizations,
          governance, people, positions and geographic context.
        </p>
        <p className="text-muted-foreground">
          The platform is designed to make civic information easier to discover
          and community work easier to coordinate. Users can create and
          contribute to shared spaces, publish updates and resources, and build
          a lasting record of local action.
        </p>
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>Version 1.0.0</p>
          <p>Contact: <a className="text-primary hover:underline" href="mailto:contact@citizenaction.in">contact@citizenaction.in</a></p>
          <p>© {new Date().getFullYear()} Citizen Action</p>
        </div>
      </div>
    </article>
  );
}
