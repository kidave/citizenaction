import { useEffect, useState } from "react";
import { Loader2, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ADMIN_LEVELS = [
  ["2", "Country"],
  ["4", "State / Union territory"],
  ["5", "District"],
  ["6", "Subdistrict / Taluka"],
  ["7", "Block / Revenue circle"],
  ["8", "Municipality / local body"],
  ["9", "Village"],
  ["10", "Revenue survey"],
];

export default function OSMJurisdictionPicker({ value, onChange, disabled = false }) {
  const [query, setQuery] = useState(value?.name || "");
  const [adminLevel, setAdminLevel] = useState(String(value?.admin_level || "2"));
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);

  useEffect(() => {
    setQuery(value?.name || "");
    if (value?.admin_level) setAdminLevel(String(value.admin_level));
  }, [value?.name, value?.admin_level]);

  const search = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/osm-admin?q=${encodeURIComponent(trimmed)}&admin_level=${encodeURIComponent(adminLevel)}`);
      if (!response.ok) throw new Error("OSM search failed");
      const data = await response.json();
      setResults(Array.isArray(data?.results) ? data.results : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const selectResult = async (result) => {
    try {
      setLookupLoading(true);
      const response = await fetch(`/api/osm-admin-lookup?osm_type=${encodeURIComponent(result.osm_type)}&osm_id=${encodeURIComponent(result.osm_id)}`);
      if (!response.ok) throw new Error("OSM boundary lookup failed");
      const data = await response.json();
      onChange?.({
        osm_type: result.osm_type,
        osm_id: result.osm_id,
        name: result.name,
        admin_level: result.admin_level,
        geojson: data?.feature?.geometry || null,
      });
      setResults([]);
    } catch {
      onChange?.({
        osm_type: result.osm_type,
        osm_id: result.osm_id,
        name: result.name,
        admin_level: result.admin_level,
        geojson: null,
      });
      setResults([]);
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="grid gap-2 sm:grid-cols-[1fr_180px_auto]">
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search an OSM administrative boundary" disabled={disabled} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); search(); } }} />
        <Select value={adminLevel} onValueChange={setAdminLevel} disabled={disabled}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{ADMIN_LEVELS.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
        </Select>
        <Button type="button" variant="outline" onClick={search} disabled={disabled || loading || !query.trim()}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          <span className="sr-only">Search OSM</span>
        </Button>
      </div>
      {results.length > 0 && <div className="overflow-hidden rounded-lg border bg-background">{results.map((result) => <button key={`${result.osm_type}-${result.osm_id}`} type="button" onClick={() => selectResult(result)} disabled={lookupLoading} className="flex w-full items-center gap-3 border-b px-3 py-2.5 text-left last:border-b-0 hover:bg-muted/50"><MapPin className="h-4 w-4 shrink-0 text-muted-foreground" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{result.name}</span><span className="block text-xs text-muted-foreground">OSM relation {result.osm_id} · admin level {result.admin_level}</span></span></button>)}</div>}
      {value?.name && <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm"><MapPin className="h-4 w-4 shrink-0 text-muted-foreground" /><span className="min-w-0 truncate">{value.name}</span><span className="ml-auto shrink-0 text-xs text-muted-foreground">Level {value.admin_level}</span></div>}
    </div>
  );
}
