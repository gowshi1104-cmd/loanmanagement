import React, { useEffect, useMemo, useState } from "react";

import {
  Ticket,
  Search,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  Save,
  X,
  ArrowLeft,
} from "lucide-react";

import toast from "react-hot-toast";

import {
  getAllSupportTickets,
  updateSupportTicket,
} from "../../services/supportService";

const statusOptions = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

const statusConfig = {
  OPEN: {
    label: "Open",
    className:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
  },
  RESOLVED: {
    label: "Resolved",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
  },
  CLOSED: {
    label: "Closed",
    className:
      "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
};

const priorityConfig = {
  LOW: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  MEDIUM:
    "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  HIGH:
    "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
};

const SupportTicketManagement = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [status, setStatus] = useState("");
  const [adminResponse, setAdminResponse] = useState("");
  const [saving, setSaving] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [pendingBack, setPendingBack] = useState(false);

  const loadTickets = async () => {
    try {
      setLoading(true);

      const response = await getAllSupportTickets();

      setTickets(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load support tickets:",
        error
      );

      toast.error(
        error?.response?.data ||
          "Failed to load support tickets"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const filteredTickets = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return tickets;
    }

    return tickets.filter((ticket) => {
      return (
        ticket.ticketId?.toLowerCase().includes(value) ||
        ticket.username?.toLowerCase().includes(value) ||
        ticket.subject?.toLowerCase().includes(value) ||
        ticket.issueType?.toLowerCase().includes(value) ||
        ticket.status?.toLowerCase().includes(value)
      );
    });
  }, [tickets, search]);

  const openCount = tickets.filter(
    (ticket) =>
      ticket.status === "OPEN" ||
      ticket.status === "IN_PROGRESS"
  ).length;

  const resolvedCount = tickets.filter(
    (ticket) =>
      ticket.status === "RESOLVED" ||
      ticket.status === "CLOSED"
  ).length;

  const highPriorityCount = tickets.filter(
    (ticket) => ticket.priority === "HIGH"
  ).length;

  const openTicket = (ticket) => {
    setSelectedTicket(ticket);
    setStatus(ticket.status || "OPEN");
    setAdminResponse(ticket.adminResponse || "");
    setShowLeaveModal(false);
    setPendingBack(false);

    window.history.pushState(
      {
        supportTicketEditor: true,
      },
      "",
      window.location.href
    );
  };

  const hasUnsavedChanges = () => {
    if (!selectedTicket) {
      return false;
    }

    const originalStatus =
      selectedTicket.status || "OPEN";

    const originalResponse =
      selectedTicket.adminResponse || "";

    return (
      status !== originalStatus ||
      adminResponse !== originalResponse
    );
  };

  const closeEditor = () => {
    setSelectedTicket(null);
    setStatus("");
    setAdminResponse("");
    setShowLeaveModal(false);
    setPendingBack(false);
  };

  const requestCloseEditor = () => {
    if (saving) {
      return;
    }

    if (hasUnsavedChanges()) {
      setPendingBack(false);
      setShowLeaveModal(true);
      return;
    }

    closeEditor();
  };

  const handleUpdate = async () => {
    if (!selectedTicket) {
      return;
    }

    try {
      setSaving(true);

      const response = await updateSupportTicket(
        selectedTicket.id,
        {
          status,
          adminResponse,
        }
      );

      const updatedTicket = response.data;

      setTickets((currentTickets) =>
        currentTickets.map((ticket) =>
          ticket.id === updatedTicket.id
            ? updatedTicket
            : ticket
        )
      );

      toast.success(
        "Support ticket updated successfully"
      );

      // Save successful -> close editor
      // and remain on Support Ticket Management page
      closeEditor();
    } catch (error) {
      console.error(
        "Failed to update ticket:",
        error
      );

      toast.error(
        error?.response?.data ||
          "Failed to update support ticket"
      );
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      if (!selectedTicket) {
        return;
      }

      if (hasUnsavedChanges()) {
        // Prevent actual navigation until user confirms
        window.history.pushState(
          {
            supportTicketEditor: true,
          },
          "",
          window.location.href
        );

        setPendingBack(true);
        setShowLeaveModal(true);
        return;
      }

      closeEditor();
    };

    if (selectedTicket) {
      window.addEventListener(
        "popstate",
        handlePopState
      );
    }

    return () => {
      window.removeEventListener(
        "popstate",
        handlePopState
      );
    };
  }, [selectedTicket, status, adminResponse]);

  const stayOnPage = () => {
    setShowLeaveModal(false);
    setPendingBack(false);
  };

  const leaveWithoutSaving = () => {
    setShowLeaveModal(false);

    if (pendingBack) {
      setPendingBack(false);
      setSelectedTicket(null);
      setStatus("");
      setAdminResponse("");
      window.history.back();
      return;
    }

    closeEditor();
  };

  return (
    <div className="min-h-full w-full min-w-0 bg-slate-50 dark:bg-slate-950 p-3 sm:p-5 lg:p-6">
      <div className="mx-auto w-full max-w-[1600px] min-w-0">
        {/* Header */}
        <div className="rounded-2xl bg-slate-900 p-4 text-white shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Ticket size={20} className="shrink-0" />

                <h1 className="text-base font-bold sm:text-lg">
                  Support Ticket Management
                </h1>
              </div>

              <p className="mt-1 text-xs text-slate-300">
                Review, respond and resolve customer support tickets.
              </p>
            </div>

            <button
              type="button"
              onClick={loadTickets}
              className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold transition hover:bg-white/15 sm:w-auto"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Active Tickets
                </p>

                <p className="mt-1 text-xl font-bold text-slate-800 dark:text-slate-100">
                  {openCount}
                </p>
              </div>

              <Clock3
                className="shrink-0 text-blue-500 dark:text-blue-400"
                size={20}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Resolved
                </p>

                <p className="mt-1 text-xl font-bold text-slate-800 dark:text-slate-100">
                  {resolvedCount}
                </p>
              </div>

              <CheckCircle2
                className="shrink-0 text-emerald-500 dark:text-emerald-400"
                size={20}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  High Priority
                </p>

                <p className="mt-1 text-xl font-bold text-slate-800 dark:text-slate-100">
                  {highPriorityCount}
                </p>
              </div>

              <AlertTriangle
                className="shrink-0 text-red-500 dark:text-red-400"
                size={20}
              />
            </div>
          </div>
        </div>

        {/* Tickets */}
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 dark:border-slate-700 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                All Support Tickets
              </h2>

              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                Manage customer support requests.
              </p>
            </div>

            <div className="relative w-full lg:w-80">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search tickets..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 pl-9 pr-3 text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition focus:border-slate-400 dark:focus:border-slate-500 focus:bg-white dark:focus:bg-slate-900"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 sm:p-10">
              Loading support tickets...
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-8 text-center sm:p-10">
              <Ticket
                className="mx-auto text-slate-300 dark:text-slate-600"
                size={34}
              />

              <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                No support tickets found
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr className="text-left text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    <th className="px-4 py-3">
                      Ticket
                    </th>

                    <th className="px-4 py-3">
                      User
                    </th>

                    <th className="px-4 py-3">
                      Issue
                    </th>

                    <th className="px-4 py-3">
                      Priority
                    </th>

                    <th className="px-4 py-3">
                      Status
                    </th>

                    <th className="px-4 py-3">
                      Created
                    </th>

                    <th className="px-4 py-3 text-right">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredTickets.map((ticket) => {
                    const statusData =
                      statusConfig[ticket.status] ||
                      statusConfig.OPEN;

                    return (
                      <tr
                        key={ticket.id}
                        className="text-xs transition hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <td className="px-4 py-4">
                          <p className="font-bold text-slate-800 dark:text-slate-100">
                            {ticket.ticketId}
                          </p>

                          <p className="mt-1 max-w-[220px] truncate text-[11px] text-slate-500 dark:text-slate-400">
                            {ticket.subject}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {ticket.username || "-"}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                            {ticket.issueType}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                              priorityConfig[
                                ticket.priority
                              ] ||
                              priorityConfig.MEDIUM
                            }`}
                          >
                            {ticket.priority}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full border px-2 py-1 text-[10px] font-bold ${statusData.className}`}
                          >
                            {statusData.label}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-slate-500 dark:text-slate-400">
                          {ticket.createdAt
                            ? new Date(
                                ticket.createdAt
                              ).toLocaleDateString()
                            : "-"}
                        </td>

                        <td className="px-4 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              openTicket(ticket)
                            }
                            className="rounded-lg bg-slate-900 dark:bg-slate-700 px-3 py-2 text-[10px] font-bold text-white transition hover:bg-slate-800 dark:hover:bg-slate-600"
                          >
                            View / Update
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Ticket Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-3 py-4 sm:p-4">
          <div className="w-full max-w-2xl max-h-[95vh] overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-700 px-4 py-3.5 sm:px-5 sm:py-4">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  {selectedTicket.ticketId}
                </p>

                <h2 className="mt-1 break-words text-base font-bold text-slate-800 dark:text-slate-100">
                  {selectedTicket.subject}
                </h2>
              </div>

              <button
                type="button"
                onClick={requestCloseEditor}
                disabled={saving}
                className="shrink-0 rounded-lg p-2 text-slate-400 dark:text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="max-h-[70vh] overflow-y-auto p-4 sm:max-h-[75vh] sm:p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    User
                  </label>

                  <div className="mt-1 break-words rounded-xl bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-xs text-slate-700 dark:text-slate-200">
                    {selectedTicket.username || "-"}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    Issue Type
                  </label>

                  <div className="mt-1 break-words rounded-xl bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-xs text-slate-700 dark:text-slate-200">
                    {selectedTicket.issueType}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  Description
                </label>

                <div className="mt-1 break-words rounded-xl bg-slate-50 dark:bg-slate-800 p-3 text-xs leading-5 text-slate-700 dark:text-slate-200">
                  {selectedTicket.description}
                </div>
              </div>

              <div className="mt-4">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  Status
                </label>

                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value)
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-slate-400 dark:focus:border-slate-500"
                >
                  {statusOptions.map((option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {statusConfig[option].label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  Admin / Support Response
                </label>

                <textarea
                  value={adminResponse}
                  onChange={(e) =>
                    setAdminResponse(e.target.value)
                  }
                  rows={5}
                  placeholder="Enter response for the user..."
                  className="mt-1 w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-slate-400 dark:focus:border-slate-500"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 dark:border-slate-700 px-4 py-3.5 sm:flex-row sm:justify-end sm:px-5 sm:py-4">
              <button
                type="button"
                onClick={requestCloseEditor}
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 sm:w-auto"
              >
                <ArrowLeft size={14} />
                Cancel
              </button>

              <button
                type="button"
                onClick={handleUpdate}
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-700 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-50 sm:w-auto"
              >
                <Save size={14} />

                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Without Saving Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 px-3 py-4 sm:p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 shadow-2xl">
            <div className="p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                  <AlertTriangle size={20} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    Leave without saving?
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    You have unsaved changes. If you leave this page,
                    your changes will be lost.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 dark:border-slate-700 px-4 py-3.5 sm:flex-row sm:justify-end sm:px-5 sm:py-4">
              <button
                type="button"
                onClick={stayOnPage}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800 sm:w-auto"
              >
                Stay
              </button>

              <button
                type="button"
                onClick={leaveWithoutSaving}
                className="w-full rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-red-700 sm:w-auto"
              >
                Leave without saving
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportTicketManagement;