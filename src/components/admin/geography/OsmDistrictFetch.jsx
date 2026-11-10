"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, Loader2, RefreshCw, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const REQUEST_TIMEOUT_MS = 70000;
const RETRY_DELAY_MS = 2000;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchStateDistricts(state) {
  let lastError;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const params = new URLSearchParams({
        admin_level: "5",
        list: "1",
        state_name: state.name,
        limit: "500",
      });
      const response = await fetch("/api/osm-admin?" + params.toString(), {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal,
        cache: "no-store",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload.complete !== true) {
        throw new Error(payload.details || payload.error || ("Request failed (" + response.status + ")"));
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
        attempts: attempt + 1,
      };
    } catch (error) {
      lastError = error.name === "AbortError"
        ? new Error("Request exceeded 70 seconds")
        : error;
      if (attempt === 0) await wait(RETRY_DELAY_MS);
    } finally {
      clearTimeout(timeout);
    }
  }

  return {
    state_id: state.id,
    state_name: state.name,
    state_osm_id: state.osm_id,
    count: 0,
    results: [],
    complete: false,
    error: lastError?.message || "Request failed",
    attempts: 2,
  };
}

export default function OsmDistrictFetch() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [states, setStates] = useState([]);
  const [selectedStateId, setSelectedStateId] = useState("");
  const [report, setReport] = useState(null);
  const [activeStateName, setActiveStateName] = useState("");

  const totalDistricts = useMemo(
    () => (report?.states || []).reduce((sum, state) => sum + state.count, 0),
    [report],
  );
  const failedStates = useMemo(
    () => (report?.states || []).filter((state) => !state.complete),
    [report],
  );
  const successfulStates = report?.states?.filter((state) => state.complete).length || 0;
  const selectedState = states.find((state) => state.id === selectedStateId);

  const loadStates = useCallback(async () => {
    if (states.length) return states;
    const { data, error } = await supabase
      .from("geographies")
      .select("id,name,osm_id,admin_level")
      .eq("geography_type", "state")
      .eq("country_code", "IN")
      .eq("admin_level", 4)
      .not("osm_id", "is", null)
      .order("name", { ascending: true });
    if (error) throw error;
    if (!data?.length) throw new Error("No OSM-linked Indian states were found.");
    setStates(data);
    setSelectedStateId(data[0].id);
    if (data.length !== 36) {
      toast.warning("Found " + data.length + " states/UTs; expected 36. Review the state list.");
    }
    return data;
  }, [states.length]);

  useEffect(() => {
    loadStates().catch((error) => {
      toast.error(error.message || "Unable to load Indian states.");
    });
  }, [loadStates]);

  const saveResult = (result, stateCount) => {
    setReport((previous) => {
      const existing = previous?.states || [];
      const nextStates = [
        ...existing.filter((item) => item.state_id !== result.state_id),
        result,
      ].sort((a, b) => a.state_name.localeCompare(b.state_name));
      return {
        fetched_at: new Date().toISOString(),
        state_count: stateCount,
        successful_states: nextStates.filter((item) => item.complete).length,
        failed_states: nextStates.filter((item) => !item.complete).length,
        district_count: nextStates.reduce((sum, item) => sum + item.count, 0),
        states: nextStates,
      };
    });
  };

  const runStates = async (targets, allStates) => {
    if (running || !targets.length) return;
    setRunning(true);
    setProgress(0);
    try {
      let completed = 0;
      for (const state of targets) {
        setActiveStateName(state.name);
        const result = await fetchStateDistricts(state);
        saveResult(result, allStates.length);
        completed += 1;
        setProgress(Math.round((completed / targets.length) * 100));
      }
      toast.success("Finished " + targets.length + " state request(s). Successful results are retained; failed states can be retried.");
    } catch (error) {
      toast.error(error.message || "Unable to fetch OSM districts.");
    } finally {
      setActiveStateName("");
      setRunning(false);
    }
  };

  const runSelected = async () => {
    try {
      const allStates = await loadStates();
      const state = allStates.find((item) => item.id === selectedStateId) || allStates[0];
      if (state) await runStates([state], allStates);
    } catch (error) {
      toast.error(error.message || "Unable to load states.");
    }
  };

  const runAll = async () => {
    try {
      const allStates = await loadStates();
      await runStates(allStates, allStates);
    } catch (error) {
      toast.error(error.message || "Unable to load states.");
    }
  };

  const retryFailed = async () => {
    try {
      const allStates = await loadStates();
      const failedIds = new Set(failedStates.map((item) => item.state_id));
      const targets = allStates.filter((state) => failedIds.has(state.id));
      await runStates(targets, allStates);
    } catch (error) {
      toast.error(error.message || "Unable to retry failed states.");
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
      <CardHeader className="space-y-3">
        <div>
          <CardTitle className="text-base">OpenStreetMap district fetch</CardTitle>
          <CardDescription className="mt-1">
            Fetch each state independently and sequentially. Results are retained between runs. This is read-only and does not write to geographies.
          </CardDescription>
        </div>
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
          <Select value={selectedStateId} onValueChange={setSelectedStateId} disabled={running}>
            <SelectTrigger aria-label="Select state or union territory">
              <SelectValue placeholder="Select a state or UT" />
            </SelectTrigger>
            <SelectContent>
              {states.map((state) => (
                <SelectItem key={state.id} value={state.id}>{state.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" onClick={runSelected} disabled={running}>
            {running && activeStateName ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Fetching…</> : "Fetch selected"}
          </Button>
          <Button type="button" variant="outline" onClick={runAll} disabled={running}>
            <RefreshCw className="mr-2 h-4 w-4" />Fetch all sequentially
          </Button>
        </div>
        {failedStates.length > 0 && (
          <div className="flex items-center justify-between gap-2 rounded-md border border-destructive/30 p-3">
            <p className="text-sm">{failedStates.length} state request(s) failed.</p>
            <Button type="button" size="sm" variant="outline" onClick={retryFailed} disabled={running}>
              <RotateCcw className="mr-2 h-4 w-4" />Retry failed
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {running && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Processing {activeStateName || "state requests"} one at a time</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}
        {report && (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-md border p-3"><div className="text-xs text-muted-foreground">District relations</div><div className="text-2xl font-semibold tabular-nums">{totalDistricts}</div></div>
              <div className="rounded-md border p-3"><div className="text-xs text-muted-foreground">States successful</div><div className="text-2xl font-semibold tabular-nums">{successfulStates}/{report.state_count}</div></div>
              <div className="rounded-md border p-3"><div className="text-xs text-muted-foreground">Failed requests</div><div className="text-2xl font-semibold tabular-nums">{failedStates.length}</div></div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">Last updated {new Date(report.fetched_at).toLocaleString()}. Only successful responses are counted as complete.</p>
              <Button type="button" size="sm" variant="outline" onClick={downloadReport}><Download className="mr-2 h-4 w-4" />Export JSON</Button>
            </div>
            <div className="max-h-[420px] overflow-y-auto rounded-md border">
              <div className="divide-y">
                {report.states.map((state) => (
                  <div key={state.state_id} className="flex items-start justify-between gap-3 px-3 py-2.5 text-sm">
                    <div className="min-w-0">
                      <div className="font-medium">{state.state_name}</div>
                      {state.error && <div className="mt-1 text-xs text-destructive">{state.error}</div>}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="tabular-nums text-muted-foreground">{state.count}</span>
                      <Badge variant={state.complete ? "secondary" : "destructive"}>{state.complete ? "Complete response" : "Failed"}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {failedStates.length > 0 && <p className="text-sm text-destructive">This is a partial dataset. Retry failed states before using it for LGD reconciliation.</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}
