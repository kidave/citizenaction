"use client";
import { useState } from "react";
import { Plus, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useGovernanceCatalog } from "@/hooks/governance/useGovernanceCatalog";
import { useGovernanceDirectory } from "@/hooks/governance/useGovernanceDirectory";
import { GOVERNANCE_TYPES, formatGovernanceFilterType } from "@/utils/governance";
export default function GovernanceDirectoryToolbar({tab,tabs,search,onSearchChange,organizationType,onOrganizationTypeChange,categoryId,onCategoryIdChange,organizationId,onOrganizationIdChange,currentOnly,onCurrentOnlyChange,canManage=false,onCreate}) {
 const [filtersOpen,setFiltersOpen]=useState(false);
 const {categories=[]}=useGovernanceCatalog({enabled:true});
 const orgQuery=useGovernanceDirectory({tab:"organizations",enabled:filtersOpen&&tab!=="organizations"});
 const organizations=(orgQuery.data||[]).filter(item=>!["person","position"].includes(item.entity_type));
 const activeFilters=[...(tab==="organizations"&&organizationType!=="all"?[formatGovernanceFilterType(organizationType)]:[]),...(tab==="organizations"&&categoryId!=="all"?[categories.find(item=>item.id===categoryId)?.name].filter(Boolean):[]),...(tab!=="organizations"&&organizationId!=="all"?[organizations.find(item=>item.id===organizationId)?.name||"Organization"]:[]),...(tab==="people"&&currentOnly?["Currently associated"]:[])];
 const placeholder=tab==="organizations"?"Search organizations...":tab==="positions"?"Search positions...":"Search people...";
 const addLabel=tab==="organizations"?"Add organization":tab==="positions"?"Add position":"Add person";
 const clear=()=>{onOrganizationTypeChange("all");onCategoryIdChange("all");onOrganizationIdChange("all");onCurrentOnlyChange(false);};
 return <div className="mb-4 min-w-0 space-y-2">
  <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-center">
   <div className="min-w-0 shrink-0">{tabs}</div>
   <div className="flex min-w-0 flex-1 items-center gap-2">
    <div className="relative min-w-0 flex-1">
     <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
     <Input value={search} onChange={e=>onSearchChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} className="h-10 pl-9"/>
     {search&&<button type="button" aria-label="Clear search" onClick={()=>onSearchChange("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted"><X className="h-3.5 w-3.5"/></button>}
    </div>
    <Button type="button" variant="outline" className="h-10 shrink-0 gap-2 px-3" onClick={()=>setFiltersOpen(true)}>
     <SlidersHorizontal className="h-4 w-4"/><span className="hidden sm:inline">Filters</span>
     {activeFilters.length>0&&<span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] text-primary-foreground">{activeFilters.length}</span>}
    </Button>
    {canManage&&<Button type="button" className="h-10 shrink-0 px-3 sm:px-4" onClick={onCreate} aria-label={addLabel}><Plus className="h-4 w-4 sm:mr-2"/><span className="hidden sm:inline">{addLabel}</span></Button>}
   </div>
  </div>
  {activeFilters.length>0&&<div className="flex flex-wrap items-center gap-1.5">{activeFilters.map(label=><span key={label} className="inline-flex items-center rounded-full border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground">{label}</span>)}<button type="button" onClick={clear} className="px-1.5 py-1 text-xs text-muted-foreground underline-offset-4 hover:underline">Clear all</button></div>}
  <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
   <SheetContent side="right" className="flex h-full w-[min(24rem,92vw)] flex-col gap-0 p-0 sm:max-w-sm">
    <SheetHeader className="border-b px-5 py-4 text-left"><SheetTitle>Directory filters</SheetTitle><SheetDescription>{tab==="organizations"?"Narrow organizations by type and category.":tab==="positions"?"Find positions within an organization.":"Find people by organization and current appointment."}</SheetDescription></SheetHeader>
    <div className="flex-1 space-y-5 overflow-y-auto p-5">
     {tab==="organizations"&&<>
      <div className="space-y-2"><Label>Organization type</Label><Select value={organizationType} onValueChange={onOrganizationTypeChange}><SelectTrigger><SelectValue placeholder="All types"/></SelectTrigger><SelectContent><SelectItem value="all">All types</SelectItem>{GOVERNANCE_TYPES.map(item=><SelectItem key={item} value={item}>{formatGovernanceFilterType(item)}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-2"><Label>Category</Label><Select value={categoryId} onValueChange={onCategoryIdChange}><SelectTrigger><SelectValue placeholder="All categories"/></SelectTrigger><SelectContent><SelectItem value="all">All categories</SelectItem>{categories.map(item=><SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></div>
     </>}
     {tab!=="organizations"&&<div className="space-y-2"><Label>Organization</Label><Select value={organizationId} onValueChange={onOrganizationIdChange}><SelectTrigger><SelectValue placeholder="All organizations"/></SelectTrigger><SelectContent><SelectItem value="all">All organizations</SelectItem>{organizations.map(item=><SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></div>}
     {tab==="people"&&<label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3"><Checkbox checked={currentOnly} onCheckedChange={onCurrentOnlyChange} className="mt-0.5"/><span className="space-y-1"><span className="block text-sm font-medium">Currently associated</span><span className="block text-xs text-muted-foreground">Only show people with an active appointment.</span></span></label>}
    </div>
    <SheetFooter className="border-t p-4 sm:flex-row"><Button type="button" variant="outline" className="w-full sm:w-auto" onClick={clear}>Clear filters</Button><Button type="button" className="w-full sm:w-auto" onClick={()=>setFiltersOpen(false)}>Done</Button></SheetFooter>
   </SheetContent>
  </Sheet>
 </div>;
}
