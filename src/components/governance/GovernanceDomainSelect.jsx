import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GOVERNANCE_DOMAINS } from "@/utils/governance";

export const UNASSIGNED_DOMAIN_VALUE = "__unassigned__";
export const UNCHANGED_DOMAIN_VALUE = "__unchanged__";

export default function GovernanceDomainSelect({
  value = null,
  onValueChange,
  disabled = false,
  includeUnchanged = false,
}) {
  const selectedValue = value == null ? UNASSIGNED_DOMAIN_VALUE : value;
  return (
    <Select
      value={selectedValue}
      onValueChange={(nextValue) => onValueChange?.(
        nextValue === UNASSIGNED_DOMAIN_VALUE ? null : nextValue
      )}
      disabled={disabled}
    >
      <SelectTrigger><SelectValue placeholder="Select a domain" /></SelectTrigger>
      <SelectContent>
        {includeUnchanged && <SelectItem value={UNCHANGED_DOMAIN_VALUE}>Keep existing domain</SelectItem>}
        <SelectItem value={UNASSIGNED_DOMAIN_VALUE}>Unassigned</SelectItem>
        {GOVERNANCE_DOMAINS.map((domain) => (
          <SelectItem key={domain.value} value={domain.value}>{domain.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
