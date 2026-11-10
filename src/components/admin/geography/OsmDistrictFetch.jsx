"use client";

import { useMemo, useState } from "react";
import { Download, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const CONCURRENCY = 3;
const REQUEST_TIMEOUT_MS = 120000;

async function mapWithConcurrency(items, concurrency, mapper) {
  const output = new Array(items.length);
  let nextIndex = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (true) {
      const index = nextIndex++;
      if (index >= items.length) return;
      output[index] = await mapper(items[index], index);
    }
  });
  await Promise.all(workers);
  return output;
}

async function fetchStateDistricts(state) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const params = new URLSearchParams({
      admin_level: "5",
      list: "1",
      parent_osm_id: String(state.osm_id),
      limit: "500",
    });
    const response = await fetch(`/api/osm-admin?${params.toString()}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.complete !== true) {
      throw new Error(payload.details || payload.error || `Request failed (${response.status})`);
    }
    return {
      state_id: state.id,
      state_name: state.name,
      state_osm_id: state.osm_id,
      count: payload.count || 0,
      osm_timestamp: payload.osm_timestamp || null,
      results: (payload.results || []).map((item) => ({
        ...item,
        parent_id: state.id,
        parent_name: state.name,
      })),
      complete: true,
    };
  } catch (error) {
    return {
      state_id: state.id,
      state_name: state.name,
      state_osm_id: state.osm_id,
      count: 0,
      results: [],
      complete: false,
      error: error.name === "AbortError" ? "Request timed out after 120 seconds" : error.message,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export default function OsmDistrictFetch() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState(null);

  const totalDistricts = useMemo(
    () => (report?.states || []).reduce((sum, state) => sum + state.count, 0),
    [report],
  );
  const failedStates = useMemo(
    () => (report?.states || []).filter((state) => !state.complete),
    [report],
  );

  const runFetch = async () => {
    if (running) return;
    setRunning(true);
    setProgress(0);
    setReport(null);
    try {
      const { data: states, error } = await supabase
        .from("geographies")
        .select("id,name,osm_id,admin_level")
        .eq("geography_type", "state")
        .eq("country_code", "IN")
        .eq("admin_level", 4)
        .not("osm_id", "is", null)
        .order("name", { ascending: true });
      if (error) throw error;
      if (!states?.length) throw new Error("No OSM-linked Indian states were found.");
      if (states.length !== 36) {
        toast.warning(`Found ${states.length} states/UTs; expected 36. Results will be marked for review.`);
      }

      let completed = 0;
      const results = await mapWithConcurrency(states, CONCURRENCY, async (state) => {
        const result = await fetchStateDistricts(state);
        completed += 1;
        setProgress(Math.round((completed / states.length) * 100));
        return result;
      });
      const combined = {
        fetched_at: new Date().toISOString(),
        state_count: states.length,
        successful_states: results.filter((item) => item.complete).length,
        failed_states: results.filter((item) => !item.complete).length,
        district_count: results.reduce((sum, item) => sum + item.count, 0),
        states: results,
      };
      setReport(combined);
      if (combined.failed_states) {
        toast.error(`Fetched ${combined.successful_states}/${combined.state_count} states. Retry failed states before using this dataset.`);
      } else {
        toast.success(`Fetched ${combined.district_count} district relations across ${combined.state_count} states/UTs.`);
      }
    } catch (error) {
      toast.error(error.message || "Unable to fetch OSM districts.");
    } finally {
      setRunning(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "india-osm-district-fetch.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-base">OpenStreetMap district fetch</CardTitle>
          <CardDescription className="mt-1">
            Fetch admin_level=5 relations separately inside each state's OSM boundary. This is a read-only collection step; it does not write to geographies.
          </CardDescription>
        </div>
        <Button type="button" onClick={runFetch} disabled={running} className="shrink-0">
          {running ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Fetching…</> : <><RefreshCw className="mr-2 h-4 w-4" />Fetch all states</>}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {running && <div className="space-y-2"><div className="flex justify-between text-xs text-muted-foreground"><span>State requests completed</span><span>{progress}%</span></div><Progress value={progress} /></div>}
        {report && <>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border p-3"><div className="text-xs text-muted-foreground">District relations</div><div className="text-2xl font-semibold tabular-nums">{totalDistricts}</div></div>
            <div className="rounded-md border p-3"><div className="text-xs text-muted-foreground">States successful</div><div className="text-2xl font-semibold tabular-nums">{report.successful_states}/{report.state_count}</div></div>
            <div className="rounded-md border p-3"><div className="text-xs text-muted-foreground">Failed requests</div><div className="text-2xl font-semibold tabular-nums">{report.failed_states}</div></div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">Fetched {new Date(report.fetched_at).toLocaleString()}. Review state-level counts before using this data.</p>
            <Button type="button" size="sm" variant="outline" onClick={downloadReport}><Download className="mr-2 h-4 w-4" />Export JSON</Button>
          </div>
          <div className="max-h-[420px] overflow-y-auto rounded-md border">
            <div className="divide-y">
              {report.states.map((state) => <div key={state.state_id} className="flex items-start justify-between gap-3 px-3 py-2.5 text-sm">
                <div className="min-w-0"><div className="font-medium">{state.state_name}</div>{state.error && <div className="mt-1 text-xs text-destructive">{state.error}</div>}</div>
                <div className="flex shrink-0 items-center gap-2"><span className="tabular-nums text-muted-foreground">{state.count}</span><Badge variant={state.complete ? "secondary" : "destructive"}>{state.complete ? "Complete response" : "Failed"}</Badge></div>
              </div>)}
            </div>
          </div>
          {failedStates.length > 0 && <p className="text-sm text-destructive">Do not treat this dataset as complete. Run the fetch again after resolving the failed state requests.</p>}
        </>}
      </CardContent>
    </Card>
  );
}
