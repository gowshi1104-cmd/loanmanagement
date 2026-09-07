import React from "react";
import {
  Ticket,
  Clock3,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
} from "lucide-react";

const statusConfig = {
  OPEN: {
    label: "Open",
    className:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900",
    icon: Ticket,
  },
  IN_PROGRESS: {
    label: "In Progress",
    className:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
    icon: Clock3,
  },
  RESOLVED: {
    label: "Resolved",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
    icon: CheckCircle2,
  },
  CLOSED: {
    label: "Closed",
    className:
      "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    icon: CheckCircle2,
  },
};

const priorityConfig = {
  LOW: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  MEDIUM:
    "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  HIGH:
    "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
};

const MyTickets = ({ tickets = [] }) => {
  if (!tickets.length) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 text-center shadow-sm sm:p-8">
        <Ticket
          className="mx-auto text-slate-300 dark:text-slate-600"
          size={34}
        />

        <h3 className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">
          No tickets yet
        </h3>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Your support tickets will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
      <div className="border-b border-slate-200 dark:border-slate-700 px-4 py-3.5 sm:px-5 sm:py-4">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
          My Support Tickets
        </h2>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Track your support requests and responses.
        </p>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {tickets.map((ticket) => {
          const status =
            statusConfig[ticket.status] || statusConfig.OPEN;

          const StatusIcon = status.icon;

          return (
            <div
              key={ticket.id}
              className="p-4 transition hover:bg-slate-50 dark:hover:bg-slate-800 sm:p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="break-all text-[11px] font-bold text-slate-400 dark:text-slate-500">
                      {ticket.ticketId}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold ${status.className}`}
                    >
                      <StatusIcon size={11} />
                      {status.label}
                    </span>

                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                        priorityConfig[ticket.priority] ||
                        priorityConfig.MEDIUM
                      }`}
                    >
                      {ticket.priority}
                    </span>
                  </div>

                  <h3 className="mt-2 break-words text-sm font-bold text-slate-800 dark:text-slate-100">
                    {ticket.subject}
                  </h3>

                  <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    {ticket.issueType} •{" "}
                    {ticket.createdAt
                      ? new Date(ticket.createdAt).toLocaleString()
                      : "-"}
                  </div>

                  <p className="mt-3 break-words text-xs leading-5 text-slate-600 dark:text-slate-300">
                    {ticket.description}
                  </p>

                  {ticket.adminResponse && (
                    <div className="mt-4 rounded-xl border border-indigo-100 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/40 p-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                        <MessageSquare size={14} />
                        Support Response
                      </div>

                      <p className="mt-2 break-words text-xs leading-5 text-indigo-900 dark:text-indigo-200">
                        {ticket.adminResponse}
                      </p>
                    </div>
                  )}

                  {!ticket.adminResponse &&
                    (ticket.status === "OPEN" ||
                      ticket.status === "IN_PROGRESS") && (
                      <div className="mt-4 flex items-start gap-2 text-[11px] text-slate-400 dark:text-slate-500">
                        <AlertCircle size={13} className="mt-0.5 shrink-0" />
                        <span>
                          Waiting for support team response.
                        </span>
                      </div>
                    )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyTickets;