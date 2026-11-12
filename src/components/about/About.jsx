export default function About() {
  return (
    <article className="space-y-6">
      <header><h1 className="text-2xl font-semibold tracking-tight">About Citizen Action</h1></header>
      <div className="space-y-4 text-muted-foreground">
        <p>Citizen Action is an independent civic documentation and participation platform designed to make civic information easier to discover, contribute to and understand.</p>
        <p>The platform brings together community updates and resources with structured information about public organizations, governance positions, appointments and geographic boundaries.</p>
        <p>Our goal is to support informed participation and make useful civic knowledge more accessible to communities.</p>
        <p>Contact <a className="text-foreground underline underline-offset-4" href="mailto:contact@citizenaction.in">contact@citizenaction.in</a> for questions or support.</p>
      </div>
    </article>
  );
}
