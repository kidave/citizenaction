import tableStyles from "styles/components/table.module.css";

export default function ActionTableFilters({
  filters,
  enumOptions,
  onFilterChange,
}) {
  return (
    <div className={tableStyles.filters}>
      <select
        value={filters.action_type}
        onChange={(e) => onFilterChange("action_type", e.target.value)}
        className={tableStyles.filterInput}
      >
        <option value="">Filter by Type</option>
        {(enumOptions.action_type || []).map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Filter by Description"
        value={filters.description}
        onChange={(e) => onFilterChange("description", e.target.value)}
        className={tableStyles.filterInput}
      />
    </div>
  );
}
