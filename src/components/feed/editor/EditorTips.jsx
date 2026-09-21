"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CircleHelp } from "lucide-react";
const tips=[
  ["Write the action","Use the title and body to explain what happened, where, and why it matters."],
  ["Add resources","Images and documents can be added together. Use Edit on a resource to add credit, description, or image alt text."],
  ["Add links","Links are kept separately from attachments. You can edit their title or description after adding them."],
  ["Add context","Use the date/time and location controls when they describe the event itself, not merely when you created the post."]
];
export default function EditorTips(){
 const [step,setStep]=useState(0); const [open,setOpen]=useState(false);
 const tip=tips[step];
 return <Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><Button type="button" variant="ghost" size="icon" aria-label="Post editor tips"><CircleHelp className="h-4 w-4"/></Button></PopoverTrigger><PopoverContent align="end" className="w-80 p-0"><div className="border-b px-4 py-3"><div className="text-sm font-semibold">Post editor tips</div><div className="text-xs text-muted-foreground">Tip {step+1} of {tips.length}</div></div><div className="p-4"><div className="text-sm font-medium">{tip[0]}</div><p className="mt-1 text-xs leading-5 text-muted-foreground">{tip[1]}</p><div className="mt-4 flex justify-between"><Button type="button" variant="ghost" size="sm" onClick={()=>setStep((step-1+tips.length)%tips.length)}>Back</Button><Button type="button" variant="ghost" size="sm" onClick={()=>setStep((step+1)%tips.length)}>{step===tips.length-1?"Restart":"Next"}</Button></div></div></PopoverContent></Popover>;
}