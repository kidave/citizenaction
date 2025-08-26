// components\ward\tabs\UpdateTab.js
import TimelineUpdate from "./Timeline/TimelineUpdate";
import { useWard } from "context/WardContext";
import useWardUpdates from "hooks/useWardUpdates";
import Spinner from "components/shared/ui/Spinner";

export default function UpdateTab() {
  const { wardId } = useWard();
  const { updates, loading, error } = useWardUpdates(wardId);

  if (loading) return <Spinner />;
  if (error) return <div>Error loading updates: {error.message}</div>;

  return <TimelineUpdate updates={updates} />;
}
