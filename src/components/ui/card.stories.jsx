import { Card } from "./card";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
import { Button } from "./button";

const meta = {
  title: "UI Primitives/Layout/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
};

export default meta;

export const Default = {
  render: () => (
    <Card className="w-full max-w-md bg-card">
      <CardHeader>
        <CardTitle>Community proposal</CardTitle>
        <CardDescription>Review the latest neighborhood update.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          A safe, accessible public space starts with local feedback.
        </p>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="outline">Details</Button>
        <Button>Support</Button>
      </CardFooter>
    </Card>
  ),
};
