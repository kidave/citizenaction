/** @type { import('@storybook/nextjs-vite').Preview } */
import { useEffect } from "react";
import { Toaster } from "sonner";
import { sb } from "storybook/test";

import { FloatingMenuProvider } from "../src/components/layout/FloatingMenuContext";
import { TooltipProvider } from "../src/components/ui/tooltip";
import "../src/styles/main.css";

sb.mock("../src/components/post/PostModal.jsx");
sb.mock("../src/lib/supabase/client.js");

const themeNames = ["dark", "space", "vintage"];

function withCitizenActionTheme(Story, { globals }) {
  const theme = globals.theme || "light";

  useEffect(() => {
    const root = document.documentElement;
    const previousThemes = themeNames.filter((name) =>
      root.classList.contains(name),
    );

    root.classList.remove(...themeNames);
    if (themeNames.includes(theme)) {
      root.classList.add(theme);
    }

    return () => {
      root.classList.remove(...themeNames);
      root.classList.add(...previousThemes);
    };
  }, [theme]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TooltipProvider delayDuration={150}>
        <FloatingMenuProvider>
          <Story />
          <Toaster richColors position="top-right" />
        </FloatingMenuProvider>
      </TooltipProvider>
    </div>
  );
}

const preview = {
  globalTypes: {
    theme: {
      description: "Citizen Action theme",
      defaultValue: "light",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        items: ["light", "dark", "space", "vintage"],
        dynamicTitle: true,
      },
    },
  },
  decorators: [withCitizenActionTheme],
  parameters: {
    backgrounds: {
      disable: true,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      test: "error",
    },
  },
};

export default preview;
