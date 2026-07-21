import { Camera, MessageSquare, CheckCircle2, FileText } from "lucide-react";

export const CONTRIBUTION_TYPES = [
  {
    value: "observation",
    label: "Observation",
    icon: Camera,
    desc: "Document field observations and evidence.",
  },
  {
    value: "comment",
    label: "Comment",
    icon: MessageSquare,
    desc: "Provide additional context or discussion.",
  },
  {
    value: "verification",
    label: "Verification",
    icon: CheckCircle2,
    desc: "Verify existing information.",
  },
  {
    value: "document",
    label: "Document",
    icon: FileText,
    desc: "Upload supporting documentation.",
  },
];
