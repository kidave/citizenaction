import ActionTable from "./Action/ActionTable";
import { useWard } from "context/WardContext";
import { useWardActions } from "hooks/useWardData";

export default function ActionTab({ actions }) {
  return <ActionTable actions={actions} />;
}
