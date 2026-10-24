import { useState } from "react";
import { useForm } from "react-hook-form";
import { Mail, Search } from "lucide-react";
import { expect, userEvent, within } from "storybook/test";

import { Calendar } from "./calendar";
import { Checkbox } from "./checkbox";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "./combobox";
import { DateTimePicker } from "./date-time";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "./field";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "./input-group";
import { Input } from "./input";
import { Label } from "./label";
import { Progress } from "./progress";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import SearchableSelect from "./SearchableSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Slider } from "./slider";
import { Switch } from "./switch";
import { Textarea } from "./textarea";
import { Toggle } from "./toggle";
import { ToggleGroup, ToggleGroupItem } from "./toggle-group";
import { Button } from "./button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "./button-group";

function FormExample() {
  const methods = useForm({ defaultValues: { email: "" } });

  return (
    <Form {...methods}>
      <form
        className="w-full max-w-sm space-y-4"
        onSubmit={methods.handleSubmit(() => {})}
      >
        <FormField
          control={methods.control}
          name="email"
          rules={{ required: "Enter your email address." }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.org" {...field} />
              </FormControl>
              <FormDescription>
                We use this address for account updates.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Continue</Button>
      </form>
    </Form>
  );
}

function SearchableSelectExample() {
  const [value, setValue] = useState("");
  const options = [
    { value: "mumbai", label: "Mumbai" },
    { value: "pune", label: "Pune" },
    { value: "nagpur", label: "Nagpur" },
  ];

  return (
    <div className="w-full max-w-sm space-y-2">
      <Label htmlFor="searchable-city">City</Label>
      <SearchableSelect
        ariaLabel="City"
        id="searchable-city"
        value={value}
        onValueChange={setValue}
        options={options}
        placeholder="Choose a city"
        searchPlaceholder="Search cities..."
      />
      <p className="text-sm text-muted-foreground">
        Selected value: {value || "None"}
      </p>
    </div>
  );
}

function DateTimeExample() {
  const [value, setValue] = useState(new Date(2025, 3, 15, 14, 30));

  return (
    <div className="w-full max-w-sm space-y-2">
      <Label>Meeting date and time</Label>
      <DateTimePicker
        label="Meeting date and time"
        value={value}
        onDateChange={setValue}
      />
      <p className="text-sm text-muted-foreground">{value.toLocaleString()}</p>
    </div>
  );
}

function CheckboxExample() {
  const [checked, setChecked] = useState(true);
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id="updates"
        checked={checked}
        onCheckedChange={setChecked}
      />
      <Label htmlFor="updates">Email me about community updates</Label>
    </div>
  );
}

const meta = {
  title: "Forms",
  tags: ["!autodocs", "!manifest"],
  parameters: {
    layout: "padded",
  },
};

export default meta;

export const TextInputs = {
  render: () => (
    <div className="grid w-full max-w-lg gap-5">
      <div className="grid gap-2">
        <Label htmlFor="email-input">Email</Label>
        <Input
          id="email-input"
          type="email"
          placeholder="you@example.org"
          autoComplete="email"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="message-input">Message</Label>
        <Textarea id="message-input" placeholder="Share your feedback..." />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="disabled-input">Disabled</Label>
        <Input id="disabled-input" disabled value="Unavailable" readOnly />
      </div>
    </div>
  ),
};

export const InputGroupComposition = {
  render: () => (
    <div className="w-full max-w-sm space-y-4">
      <InputGroup>
        <InputGroupAddon>
          <Mail aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput aria-label="Email address" placeholder="Email address" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>.org</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>
          <Search aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput aria-label="Search" placeholder="Search" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton aria-label="Choose search options">
            Filters
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
};

export const ButtonGroups = {
  render: () => (
    <div className="space-y-5">
      <ButtonGroup>
        <Button variant="outline">Back</Button>
        <ButtonGroupSeparator />
        <Button variant="outline">Continue</Button>
      </ButtonGroup>
      <ButtonGroup orientation="vertical">
        <Button variant="outline">Overview</Button>
        <ButtonGroupText>Project workspace</ButtonGroupText>
        <Button variant="outline">Activity</Button>
      </ButtonGroup>
    </div>
  ),
};

export const CheckboxStates = {
  render: () => (
    <div className="space-y-4">
      <CheckboxExample />
      <div className="flex items-center gap-2">
        <Checkbox id="disabled-check" disabled />
        <Label htmlFor="disabled-check">Disabled option</Label>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const checkbox = within(canvasElement).getByRole("checkbox", {
      name: "Email me about community updates",
    });
    await userEvent.click(checkbox);
    await expect(checkbox).not.toBeChecked();
  },
};

export const SwitchStates = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Switch id="notifications" defaultChecked />
        <Label htmlFor="notifications">Notifications enabled</Label>
      </div>
      <div className="flex items-center gap-3">
        <Switch id="notifications-disabled" disabled />
        <Label htmlFor="notifications-disabled">Disabled</Label>
      </div>
    </div>
  ),
};

export const RadioOptions = {
  render: () => (
    <RadioGroup defaultValue="public" className="grid gap-3">
      {[
        ["public", "Public space"],
        ["private", "Private group"],
        ["unlisted", "Unlisted"],
      ].map(([value, label]) => (
        <div className="flex items-center gap-2" key={value}>
          <RadioGroupItem value={value} id={`visibility-${value}`} />
          <Label htmlFor={`visibility-${value}`}>{label}</Label>
        </div>
      ))}
    </RadioGroup>
  ),
};

export const SelectOptions = {
  render: () => (
    <Select defaultValue="open">
      <SelectTrigger className="w-full max-w-sm" aria-label="Status">
        <SelectValue placeholder="Choose a status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="open">Open</SelectItem>
        <SelectItem value="in-progress">In progress</SelectItem>
        <SelectItem value="resolved">Resolved</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const SearchableOptions = {
  render: () => <SearchableSelectExample />,
};

export const ComboboxOptions = {
  render: () => (
    <Combobox items={["Mumbai", "Pune", "Nagpur"]}>
      <ComboboxInput
        placeholder="Choose a city"
        aria-label="City"
        className="w-full max-w-sm"
      />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxEmpty>No cities found.</ComboboxEmpty>
          {["Mumbai", "Pune", "Nagpur"].map((city) => (
            <ComboboxItem key={city} value={city}>
              {city}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
};

export const DateAndTime = {
  render: () => <DateTimeExample />,
};

export const DateOnly = {
  render: () => (
    <div className="w-full max-w-sm space-y-2">
      <p className="text-sm font-medium">Event date</p>
      <DateTimePicker
        mode="date"
        value={new Date(2025, 3, 15)}
        onDateChange={() => {}}
      />
    </div>
  ),
};

export const CalendarMonth = {
  render: () => (
    <Calendar
      mode="single"
      defaultMonth={new Date(2025, 3, 1)}
      selected={new Date(2025, 3, 15)}
      className="rounded-md border"
    />
  ),
};

export const RangeSlider = {
  render: () => (
    <div className="w-full max-w-sm space-y-3">
      <Label>Contribution range</Label>
      <Slider
        defaultValue={[25, 75]}
        min={0}
        max={100}
        getAriaLabel={(index) => (index === 0 ? "Minimum" : "Maximum")}
      />
    </div>
  ),
};

export const ProgressIndicators = {
  render: () => (
    <div className="w-full max-w-sm space-y-4">
      <Progress value={35} aria-label="Proposal review progress" />
      <Progress value={72} aria-label="Application completion progress" />
      <Progress value={100} aria-label="Completed progress" />
    </div>
  ),
};

export const ToggleStates = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Toggle aria-label="Toggle map" defaultPressed>
        Map
      </Toggle>
      <Toggle variant="outline" size="sm" aria-label="Toggle list">
        List
      </Toggle>
      <ToggleGroup type="single" defaultValue="recent" aria-label="Sort order">
        <ToggleGroupItem value="recent" aria-label="Sort by recent">
          Recent
        </ToggleGroupItem>
        <ToggleGroupItem value="popular" aria-label="Sort by popular">
          Popular
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
};

export const FieldLayouts = {
  render: () => (
    <FieldGroup className="max-w-lg">
      <Field>
        <FieldLabel htmlFor="field-project">Project name</FieldLabel>
        <Input id="field-project" placeholder="Accessible sidewalks" />
        <FieldDescription>
          Choose a short name people can recognize.
        </FieldDescription>
      </Field>
      <Field orientation="horizontal">
        <FieldLabel htmlFor="field-visibility">Public project</FieldLabel>
        <Switch id="field-visibility" defaultChecked />
      </Field>
    </FieldGroup>
  ),
};

export const ReactHookForm = {
  render: () => <FormExample />,
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Continue" }),
    );
    await expect(
      within(canvasElement).getByText("Enter your email address."),
    ).toBeInTheDocument();
  },
};
