"use client";
import { useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-time";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
export default function EditorDateTime({ editor }) {
  const [open,setOpen]=useState(false); const [tipStep,setTipStep]=useState(0);
  const hasStart=Boolean(editor.start_at), hasEnd=Boolean(editor.end_at);
  const summary=useMemo(()=>{if(!hasStart&&!hasEnd)return "When did this happen?";const v=[];if(hasStart)v.push(new Date(editor.start_at).toLocaleString());if(hasEnd)v.push(new Date(editor.end_at).toLocaleString());return v.join(" → ");},[editor.start_at,editor.end_at,hasStart,hasEnd]);
  return <Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><Button type="button" variant={hasStart||hasEnd?"secondary":"ghost"} size="sm" className="gap-2"><CalendarDays className="h-4 w-4"/><span className="hidden sm:inline">{summary}</span></Button></PopoverTrigger><PopoverContent align="end" className="w-[min(42rem,calc(100vw-2rem))] p-0">
    <div className="border-b px-4 py-3"><div className="text-sm font-semibold">When did this happen?</div><p className="mt-1 text-xs text-muted-foreground">Optional context for the event. The post's created date remains separate.</p></div>
    <div className="p-4"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="space-y-2"><div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Start</div><DateTimePicker value={editor.start_at?new Date(editor.start_at):null} onDateChange={(v)=>{editor.setStartAt(v?v.toISOString():null);if(!v)editor.setEndAt(null);}} mode="datetime"/></div>
      <div className="space-y-2"><div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">End</div><DateTimePicker value={editor.end_at?new Date(editor.end_at):null} onDateChange={(v)=>editor.setEndAt(v?v.toISOString():null)} mode="datetime" disabled={!hasStart}/></div>
    </div><div className="mt-4 flex justify-between border-t pt-3"><Button type="button" variant="ghost" size="sm" onClick={()=>{editor.setStartAt(null);editor.setEndAt(null);}}>Clear</Button><Button type="button" size="sm" onClick={()=>setOpen(false)}>Done</Button></div></div>
    {tipStep<2&&<div className="border-t bg-muted/30 px-4 py-3"><div className="text-xs font-semibold">Tip {tipStep+1} of 2</div><p className="mt-1 text-xs text-muted-foreground">{tipStep===0?"The post already records when it was created. Add this only when the event happened at another time.":"Start first. End becomes available after a start date is chosen. For an ongoing event, you can use the current date and time as the end."}</p><div className="mt-2 flex justify-end"><Button type="button" variant="ghost" size="sm" onClick={()=>setTipStep(s=>s+1)}>Next</Button></div></div>}</PopoverContent></Popover>;
}