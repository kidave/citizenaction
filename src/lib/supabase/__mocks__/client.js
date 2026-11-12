const storage = {
  from: (bucket) => ({
    upload: async (path) => ({ data: { path, bucket }, error: null }),
    getPublicUrl: (path) => ({
      data: {
        publicUrl: "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=",
      },
    }),
    remove: async () => ({ data: [], error: null }),
  }),
};

const supabase = {
  storage,
  functions: {
    invoke: async (_name, { body }) => ({
      data: {
        link: {
          url: body.url,
          hostname: new URL(body.url).hostname,
          title: "Storybook example link",
          type: "website",
        },
      },
      error: null,
    }),
  },
  from: () => ({
    select() {
      return this;
    },
    eq() {
      return this;
    },
    maybeSingle: async () => ({ data: null, error: null }),
  }),
};

export { supabase };
