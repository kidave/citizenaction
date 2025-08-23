// components\ward\tabs\UpdateTab.js
import TimelineUpdate from "./Timeline/TimelineUpdate";
import { useWard } from "context/WardContext";

export default function UpdateTab() {
  const { updates, loading, error } = useWard();

  if (loading) return <div>Loading updates...</div>;
  if (error) return <div>Error loading updates: {error}</div>;

  return <TimelineUpdate updates={updates} />;
}
