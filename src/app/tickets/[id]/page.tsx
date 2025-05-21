"use client";

import { getTicket, updateTicket } from "@/actions/ticket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Member,
  SupportTicket,
  SupportTicketHistory,
  SupportTicketPriority,
  SupportTicketStatus,
} from "@/prisma/generated";
import { useState, useEffect, FC } from "react";
import { useParams, useRouter } from "next/navigation";
import { FlagIcon } from "lucide-react";
import { getAllOrganizationMembers } from "@/actions/team-members";
import { MemberSelector } from "@/components/member-selector";

const priorityColors = {
  Low: "text-green-500",
  Medium: "text-yellow-500",
  High: "text-red-500",
} as const;

const IndividualTicket = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const [ticket, setTicket] = useState<
    (SupportTicket & { history: SupportTicketHistory[], assignedTo: Member[] }) | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const data = await getTicket(id as string);
        console.log(data);
        setTicket(data);
      } catch (error) {
        console.error("Failed to fetch ticket:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  const [organizationMembers, setOrganizationMembers] = useState<{ id: string; name: string; email: string }[]>([]);

useEffect(() => {
  const fetchOrganizationMembers = async () => {
    const data = await getAllOrganizationMembers();
    setOrganizationMembers(data);
  };

  fetchOrganizationMembers();
}, []);

  if (isLoading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  if (!ticket) {
    return <div className="container mx-auto p-6">Failed to load ticket</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <TicketEditor initialTicket={ticket} organizationMembers={organizationMembers} />
    </div>
  );
};

const TicketEditor: FC<{
  initialTicket: SupportTicket & { history: SupportTicketHistory[], assignedTo: Member[] };
  organizationMembers: { id: string; name: string; email: string }[];
}> = ({ initialTicket, organizationMembers }) => {
  const router = useRouter();
  const [ticket, setTicket] = useState(initialTicket);
  const [isLoading, setIsLoading] = useState(false);
  const [assignedToIds, setAssignedToIds] = useState<string[]>(
    initialTicket.assignedTo.map((m) => m.id)
  );

  const handleChange = (field: keyof SupportTicket, value: any) => {
    setTicket((prev) => ({ ...prev, [field]: value }));
  };

  const handleAssignedToChange = (memberId: string) => {
    setAssignedToIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Only send scalar fields and assignedToIds to avoid Prisma relation update errors
      const updated = await updateTicket(ticket.id, {
        customerName: ticket.customerName,
        product: ticket.product,
        issueType: ticket.issueType,
        description: ticket.description,
        whatsapp: ticket.whatsapp,
        status: ticket.status,
        priority: ticket.priority,
        assignedToIds,
      });
      
      if (updated && updated.assignedTo) {
        setTicket((prev) => ({ ...prev, assignedTo: updated.assignedTo || [] }));
      }
      router.push("/tickets");
    } catch (error) {
      console.error("Failed to save ticket:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-6 h-full">
      <div className="col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>
              <textarea
                rows={1}
                value={ticket.customerName}
                onChange={(e) => handleChange("customerName", e.target.value)}
                className="text-3xl font-bold border-hidden outline-hidden resize-none w-full"
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={ticket.status}
                  onValueChange={(value) => handleChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(SupportTicketStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <FlagIcon className="w-4 h-4" />
                  Priority
                </label>
                <Select
                  value={ticket.priority}
                  onValueChange={(value) => handleChange("priority", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(SupportTicketPriority).map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 w-full">
                <MemberSelector
                  members={organizationMembers}
                  selectedMemberIds={assignedToIds}
                  onMemberSelectionChange={handleAssignedToChange}
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">WhatsApp</label>
                <Input
                  value={ticket.whatsapp}
                  onChange={(e) => handleChange("whatsapp", e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Product</label>
                <Input
                  value={ticket.product}
                  onChange={(e) => handleChange("product", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Issue Type</label>
              <Input
                value={ticket.issueType}
                onChange={(e) => handleChange("issueType", e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={ticket.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="w-full min-h-[100px] p-2 border rounded-md resize-none"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="h-full">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ticket.history.map((entry, index) => (
                <div key={entry.id} className="border-b pb-2">
                  <p className="text-sm text-gray-500">
                    {new Date(entry.createdAt).toLocaleString()}
                  </p>
                  {index === 0 && (
                    <p>
                      New Ticket Created of priority{" "}
                      <span
                        className={`${
                          priorityColors[
                            entry.beforePriority as keyof typeof priorityColors
                          ]
                        }`}
                      >
                        {entry.beforePriority}
                      </span>
                    </p>
                  )}
                  {index !== 0 && entry.beforeStatus !== entry.afterStatus && (
                    <p>
                      Status changed from {entry.beforeStatus} to{" "}
                      {entry.afterStatus}
                    </p>
                  )}
                  {index !== 0 &&
                    entry.beforePriority !== entry.afterPriority && (
                      <p>
                        Priority changed from{" "}
                        <span
                          className={`${
                            priorityColors[
                              entry.beforePriority as keyof typeof priorityColors
                            ]
                          }`}
                        >
                          {entry.beforePriority}
                        </span>{" "}
                        to{" "}
                        <span
                          className={`${
                            priorityColors[
                              entry.afterPriority as keyof typeof priorityColors
                            ]
                          }`}
                        >
                          {entry.afterPriority}
                        </span>
                      </p>
                    )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IndividualTicket;
