import { fn } from "storybook/test";

import SelectedLocation from "./SelectedLocation";

const meta = {
  title: "Geography/Selection/Selected Location",
  component: SelectedLocation,
  args: {
    address: "14 Parliament Street, New Delhi",
    open: true,
    isMobile: false,
    onOpenChange: fn(),
    onUseLocation: fn(),
    onClear: fn(),
  },
};

export default meta;

export const AddressFound = {};

export const LookingUpAddress = {
  args: {
    address: "",
  },
};

export const MobileDrawer = {
  args: {
    isMobile: true,
  },
};
