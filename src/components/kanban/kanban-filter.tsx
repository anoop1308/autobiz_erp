"use client";

import { SupportTicketPriority, SupportTicketStatus } from "@/prisma/generated";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { useState } from "react";

type Status = SupportTicketStatus;
type Priority = SupportTicketPriority;
type FilterType = "status" | "priority";
type AssignedTo = string;

interface KanbanFilterProps {
  filterType: FilterType;
  onFilterTypeChange: (type: FilterType) => void;
  selectedStatuses: Status[];
  onStatusChange: (statuses: Status[]) => void;
  selectedPriorities: Priority[];
  onPriorityChange: (priorities: Priority[]) => void;
  assignedTo: AssignedTo;
  onAssignedToChange: (assignedTo: AssignedTo) => void;
  onApplyFilter?: (filter: {
    priorities: Priority[];
    statuses: Status[];
    assignedTo: string;
  }) => void;
}

// MultiSelectPopover component for priorities and statuses
function MultiSelectPopover<T extends string>({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  selected: T[];
  onChange: (selected: T[]) => void;
}) {
  let display = "Select...";
  if (selected.length === 1) {
    display =
      options.find((o) => o.value === selected[0])?.label || "Select...";
  } else if (selected.length === 2) {
    display = options
      .filter((o) => selected.includes(o.value))
      .map((o) => o.label)
      .join(", ");
  } else if (selected.length > 2) {
    display = `${selected.length} selected`;
  }
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {label}: {display}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="flex flex-col gap-2">
          {options.map(({ value, label }) => (
            <label
              key={value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Checkbox
                checked={selected.includes(value)}
                onCheckedChange={() => {
                  if (selected.includes(value)) {
                    onChange(selected.filter((v) => v !== value));
                  } else {
                    onChange([...selected, value]);
                  }
                }}
              />
              {label}
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function KanbanFilter({
  filterType,
  onFilterTypeChange,
  selectedStatuses,
  onStatusChange,
  selectedPriorities,
  onPriorityChange,
  assignedTo = "",
  onAssignedToChange = () => {},
  onApplyFilter = () => {},
}: KanbanFilterProps) {
  const [open, setOpen] = useState(false);
  const statuses: { value: Status; label: string }[] = [
    { value: SupportTicketStatus.New, label: "New" },
    { value: SupportTicketStatus.Acknowledged, label: "Acknowledged" },
    { value: SupportTicketStatus.Investigation, label: "Investigation" },
    {
      value: SupportTicketStatus.Awaiting_Customer_Response,
      label: "Awaiting Customer",
    },
    { value: SupportTicketStatus.In_Progress, label: "In Progress" },
    { value: SupportTicketStatus.Resolved, label: "Resolved" },
    { value: SupportTicketStatus.Closed, label: "Closed" },
  ];

  const priorities: { value: Priority; label: string }[] = [
    { value: SupportTicketPriority.Low, label: "Low" },
    { value: SupportTicketPriority.Medium, label: "Medium" },
    { value: SupportTicketPriority.High, label: "High" },
  ];

  return (
    <div className="flex justify-end gap-2 mb-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-dashed"
            onClick={() => setOpen(true)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Filter Tasks</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Priorities</Label>
              <MultiSelectPopover
                label="Priorities"
                options={priorities}
                selected={selectedPriorities}
                onChange={onPriorityChange}
              />
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <MultiSelectPopover
                label="Status"
                options={statuses}
                selected={selectedStatuses}
                onChange={onStatusChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="assigned-to">Assigned To</Label>
              <Input
                id="assigned-to"
                value={assignedTo}
                onChange={(e) => onAssignedToChange(e.target.value)}
                placeholder="Enter assignee name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => {
                onApplyFilter({
                  priorities: selectedPriorities,
                  statuses: selectedStatuses,
                  assignedTo,
                });
                setOpen(false);
              }}
            >
              Filter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
