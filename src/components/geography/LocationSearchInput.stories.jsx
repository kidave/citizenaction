import { fn } from "storybook/test";

import LocationSearchInput from "./LocationSearchInput";

const meta = {
  title: "Geography/Search/Location Search",
  component: LocationSearchInput,
  args: {
    value: "NY",
    onChange: fn(),
    onSelect: fn(),
    onUseCurrentLocation: fn(),
    onBack: fn(),
  },
};

export default meta;

export const EmptyResults = {};

export const SearchingForLocation = {
  args: {
    value: "New",
  },
  parameters: {
    docs: {
      description: {
        story:
          "The query is intentionally shorter than the API search threshold, so this example performs no network request.",
      },
    },
  },
};

export const GettingCurrentLocation = {
  args: {
    loadingGPS: true,
  },
};
