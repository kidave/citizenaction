import path from "node:path";
import { fileURLToPath } from "node:url";

/** @type { import('@storybook/nextjs-vite').StorybookConfig } */
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-mcp",
  ],
  framework: "@storybook/nextjs-vite",
  typescript: {
    reactDocgen: "react-docgen",
  },
  features: {
    componentsManifest: true,
  },
  staticDirs: ["../public"],
  viteFinal: async (config) => {
    config.resolve = config.resolve || {};
    const aliases = config.resolve.alias || [];
    const existingAliases = Array.isArray(aliases)
      ? aliases
      : Object.entries(aliases).map(([find, replacement]) => ({
          find,
          replacement,
        }));

    config.resolve.alias = [
      ...existingAliases,
      {
        find: /^@\//,
        replacement: `${path.resolve(__dirname, "../src")}${path.sep}`,
      },
    ];
    return config;
  },
};

export default config;
