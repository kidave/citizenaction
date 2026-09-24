"use client";

export default function Support() {
  return (
    <article className="space-y-8">
      <header>
        <h2 className="text-2xl font-semibold tracking-tight">Support</h2>

        <p className="mt-2 text-muted-foreground">
          Need help using Citizen Action?
        </p>
      </header>

      <div className="space-y-4">
        <p className="text-muted-foreground">
          If you have questions, found a bug or would like to suggest a feature,
          we love to hear from you.
        </p>

        <div>
          <p className="font-medium">Email</p>

          <a
            href="mailto:contact@citizenaction.in"
            className="text-primary hover:underline"
          >
            contact@citizenaction.in
          </a>
        </div>
      </div>
    </article>
  );
}
