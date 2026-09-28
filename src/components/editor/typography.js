export const typography = {
  /**
   * Normal Citizen Action application UI.
   *
   * Uses the browser/system sans-serif font.
   */
  base: {
    body: "text-base leading-6",
    title: "text-xl font-semibold leading-tight tracking-tight",
    muted: "text-sm text-muted-foreground",
  },

  /**
   * Document editing surface.
   *
   * Serif typography is intentional here.
   * This is the writing environment.
   */
  documentEditor: {
    title: "font-serif text-lg font-semibold leading-tight tracking-tight",

    body: "font-serif text-lg leading-7",

    h1: "font-serif text-4xl font-semibold leading-tight tracking-tight",

    h2: "font-serif text-3xl font-semibold leading-tight tracking-tight",

    h3: "font-serif text-2xl font-semibold leading-tight",

    list: "font-serif text-lg leading-7",

    table: "font-serif text-lg leading-7",

    warning: "font-serif text-lg leading-7",

    caption: "font-serif text-xs leading-relaxed",
  },

  /**
   * Public-facing document/post content.
   *
   * You said you are happy with the current serif
   * presentation, so public document content stays serif.
   */
  publicDocument: {
    body: "font-serif text-lg leading-7",

    title: "font-serif text-lg font-semibold leading-tight tracking-tight",

    h1: "font-serif text-4xl font-semibold leading-tight tracking-tight",

    h2: "font-serif text-3xl font-semibold leading-tight tracking-tight",

    h3: "font-serif text-2xl font-semibold leading-tight",

    list: "font-serif text-lg leading-7",

    table: "font-serif text-lg leading-7",

    warning: "font-serif text-lg leading-7",

    caption: "font-serif text-xs leading-relaxed",
  },
};
