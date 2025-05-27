"use client"

import * as React from "react"
import { Check, ChevronsUpDown, UserIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { getAllOrganizationMembers } from "@/actions/team-members"

type Member = {
  id: string
  name: string
  email: string
}

interface MemberSelectorProps {
  selectedMemberIds: string[]
  onMemberSelectionChange: (memberId: string) => void
  label?: string
}

export function MemberSelector({
  selectedMemberIds,
  onMemberSelectionChange,
  label = "Assign to"
}: MemberSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [members, setMembers] = React.useState<Member[]>([]);
  const fetchOrganizationMembers = async () => {
    const data = await getAllOrganizationMembers();
    setMembers(data);
  };
  React.useEffect(() => {
    fetchOrganizationMembers()
  },[])

  const selectedMembers = members.filter(member =>
    selectedMemberIds.includes(member.id)
  )

  const filteredMembers = React.useMemo(() => {
    if (searchQuery === "") {
      return members
    }
    const query = searchQuery.toLowerCase()
    
    return members.filter(member =>
      member.name.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query)
    )
  }, [members, searchQuery])

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">
        {label}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between"
          >
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              {selectedMembers.length > 0 ? (
                <span>{selectedMembers.length} selected</span>
              ) : (
                <span>Select members...</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput
              placeholder="Search members..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList className="max-h-[300px]">
              <CommandEmpty>No members found</CommandEmpty>
              <CommandGroup>
                {filteredMembers.map((member) => (
                  <CommandItem
                    key={member.id}
                    value={member.id}
                    onSelect={() => {
                      onMemberSelectionChange(member.id)
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col">
                        <span>{member.name}</span>
                        <span className="text-xs text-muted-foreground">{member.email}</span>
                      </div>
                      <Check
                        className={cn(
                          "h-4 w-4",
                          selectedMemberIds.includes(member.id) ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedMembers.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedMembers.map(member => (
            <Badge
              key={member.id}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {member.name}
              <button
                className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2"
                onClick={() => onMemberSelectionChange(member.id)}
              >
                <span className="sr-only">Remove</span>
                <span className="text-xs">×</span>
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
