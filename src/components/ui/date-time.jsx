"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { ChevronDownIcon } from "lucide-react"

export function DateTimePicker({
  date,
  time,
  onDateChange,
  onTimeChange,
}) {
  const [open, setOpen] = React.useState(false)

  const parsedDate = date ? new Date(date) : undefined

  return (
    <FieldGroup className="flex-row w-full gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between font-normal"
            >
              {parsedDate
                ? format(parsedDate, "PPP")
                : "Select Date"}
              <ChevronDownIcon className="h-4 w-4 opacity-60" />
            </Button>
          </PopoverTrigger>

          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="start"
          >
            <Calendar
              mode="single"
              selected={parsedDate}
              captionLayout="dropdown"
              defaultMonth={parsedDate}
              onSelect={(selected) => {
                if (!selected) return

                const iso = selected
                  .toISOString()
                  .split("T")[0]

                onDateChange(iso)
                setOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>

        <Input
          type="time"
          value={time || ""}
          onChange={(e) =>
            onTimeChange(e.target.value)
          }
          step="60"
        />  
    </FieldGroup>
  )
}