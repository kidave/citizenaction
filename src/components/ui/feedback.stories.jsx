import { AlertCircle, CheckCircle2, Clock3, FileText, Inbox } from "lucide-react";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "./alert";
import {
  Attachment,
  AttachmentAction,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "./attachment";
import { Badge } from "./badge";
import { Button } from "./button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "./empty";
import EmptyState from "./empty-state";
import ErrorState from "./error-state";
import LoadingState from "./loading-state";
import MetricCard from "./metric-card";
import { Skeleton } from "./skeleton";
import { Spinner } from "./spinner";

const meta = {
  title: "Feedback",
  tags: ["!autodocs", "!manifest"],
  parameters: {
    layout: "padded",
  },
};

export default meta;

export const Alerts = {
  render: () => (
    <div className="grid w-full max-w-2xl gap-3">
      <Alert>
        <AlertTitle>Community notice</AlertTitle>
        <AlertDescription>
          A new public consultation is open for feedback.
        </AlertDescription>
      </Alert>
      <Alert variant="success">
        <CheckCircle2 aria-hidden="true" />
        <AlertTitle>Changes saved</AlertTitle>
        <AlertDescription>Your preferences have been updated.</AlertDescription>
      </Alert>
      <Alert variant="warning">
        <Clock3 aria-hidden="true" />
        <AlertTitle>Action required</AlertTitle>
        <AlertDescription>
          Add a date before submitting this proposal.
        </AlertDescription>
      </Alert>
      <Alert variant="info">
        <AlertCircle aria-hidden="true" />
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>
          Your response will be visible to community members.
        </AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertCircle aria-hidden="true" />
        <AlertTitle>Unable to submit</AlertTitle>
        <AlertDescription>Please review the highlighted fields.</AlertDescription>
        <AlertAction>
          <Button variant="outline" size="sm">
            Retry
          </Button>
        </AlertAction>
      </Alert>
    </div>
  ),
};

export const Badges = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge>Open</Badge>
      <Badge variant="secondary">In review</Badge>
      <Badge variant="outline">Draft</Badge>
      <Badge variant="destructive">Needs attention</Badge>
    </div>
  ),
};

export const EmptyStates = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-lg border">
        <EmptyState
          title="No updates yet"
          description="New activity will appear here."
        />
      </div>
      <div className="rounded-lg border">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Inbox aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>No saved proposals</EmptyTitle>
            <EmptyDescription>
              Save a proposal to find it here later.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline">Browse proposals</Button>
          </EmptyContent>
        </Empty>
      </div>
    </div>
  ),
};

export const LoadingAndError = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-lg border">
        <LoadingState label="Loading community updates" />
      </div>
      <div className="rounded-lg border p-6">
        <div className="flex items-center gap-3">
          <Spinner />
          <span className="text-sm">Submitting your response...</span>
        </div>
      </div>
      <div className="rounded-lg border">
        <ErrorState
          title="Updates unavailable"
          description="Please try again in a moment."
        />
      </div>
    </div>
  ),
};

export const SkeletonLayouts = {
  render: () => (
    <div className="w-full max-w-lg space-y-4 rounded-xl border p-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  ),
};

export const Metric = {
  render: () => (
    <div className="w-full max-w-xs">
      <MetricCard icon={FileText} label="Open proposals" value="128" />
    </div>
  ),
};

export const AttachmentStates = {
  render: () => (
    <div className="grid w-full max-w-xl gap-3">
      {[
        ["uploading", "Uploading evidence.pdf", "Uploading file..."],
        ["done", "Meeting-notes.pdf", "PDF document · 2.4 MB"],
        ["error", "broken-image.png", "Could not process this image."],
      ].map(([state, title, description]) => (
        <Attachment key={state} state={state}>
          <AttachmentMedia variant="icon">
            <FileText aria-hidden="true" />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{title}</AttachmentTitle>
            <AttachmentDescription>{description}</AttachmentDescription>
          </AttachmentContent>
          {state === "done" && (
            <AttachmentAction aria-label="Remove attachment">
              Remove
            </AttachmentAction>
          )}
        </Attachment>
      ))}
    </div>
  ),
};
