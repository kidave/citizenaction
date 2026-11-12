import { Button } from "./button";
import { ArrowRight } from "lucide-react";

const meta = {
  title: "UI Primitives/Actions/Button Composition",
  component: Button,
};

export default meta;

export const AsLink = {
  render: () => (
    <Button asChild variant="outline">
      <a href="#component-link">
        Continue <ArrowRight aria-hidden="true" />
      </a>
    </Button>
  ),
};
