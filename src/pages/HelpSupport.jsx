import React, { useEffect, useMemo, useState } from "react";

import SupportHeader from "../components/support/SupportHeader";

import SupportContactCards from "../components/support/SupportContactCards";

import CreateTicket from "../components/support/CreateTicket";

import MyTickets from "../components/support/MyTickets";

import FAQSection from "../components/support/FAQSection";

import {
  createSupportTicket,
  getMySupportTickets,
} from "../services/supportService";

import {
  Ticket,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import toast from "react-hot-toast";

const HelpSupport = () => {
  const [showCreateTicket, setShowCreateTicket] =
    useState(false);

  const [tickets, setTickets] = useState([]);

  const [loading, setLoading] = useState(true);

  const loadTickets = async () => {
    try {
      setLoading(true);

      const response = await getMySupportTickets();

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

  const handleCreateTicket = async (formData) => {
    try {
      await createSupportTicket(formData);

      toast.success(
        "Support ticket created successfully"
      );

      setShowCreateTicket(false);

      await loadTickets();
    } catch (error) {
      console.error(
        "Failed to create support ticket:",
        error
      );

      toast.error(
        error?.response?.data ||
          "Failed to create support ticket"
      );
    }
  };

  const activeTickets = useMemo(() => {
    return tickets.filter(
      (ticket) =>
        ticket.status === "OPEN" ||
        ticket.status === "IN_PROGRESS"
    ).length;
  }, [tickets]);

  const resolvedTickets = useMemo(() => {
    return tickets.filter(
      (ticket) =>
        ticket.status === "RESOLVED" ||
        ticket.status === "CLOSED"
    ).length;
  }, [tickets]);

  const highPriorityTickets = useMemo(() => {
    return tickets.filter(
      (ticket) => ticket.priority === "HIGH"
    ).length;
  }, [tickets]);

  return (
    <div className="min-h-full w-full min-w-0 overflow-x-hidden bg-slate-50 dark:bg-slate-950 p-3 sm:p-5 lg:p-6">
      <div className="mx-auto w-full max-w-[1600px] min-w-0">

        <SupportHeader />

        <div className="mt-3 sm:mt-4 w-full min-w-0">
          <SupportContactCards
            onRaiseTicket={() =>
              setShowCreateTicket(true)
            }
          />
        </div>

        {/* Summary */}

        <div className="mt-3 sm:mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">

          <div className="min-w-0 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3.5 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">

              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Active Tickets
                </p>

                <p className="mt-1 text-xl font-bold text-slate-800 dark:text-slate-100">
                  {activeTickets}
                </p>
              </div>

              <Ticket
                size={20}
                className="shrink-0 text-blue-500 dark:text-blue-400"
              />

            </div>
          </div>

          <div className="min-w-0 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3.5 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">

              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Resolved
                </p>

                <p className="mt-1 text-xl font-bold text-slate-800 dark:text-slate-100">
                  {resolvedTickets}
                </p>
              </div>

              <CheckCircle2
                size={20}
                className="shrink-0 text-emerald-500 dark:text-emerald-400"
              />

            </div>
          </div>

          <div className="min-w-0 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3.5 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">

              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  High Priority
                </p>

                <p className="mt-1 text-xl font-bold text-slate-800 dark:text-slate-100">
                  {highPriorityTickets}
                </p>
              </div>

              <AlertTriangle
                size={20}
                className="shrink-0 text-red-500 dark:text-red-400"
              />

            </div>
          </div>

        </div>

        <div className="mt-3 sm:mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.35fr_1fr] min-w-0">

          <div className="min-w-0 overflow-hidden">
            {loading ? (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 sm:p-10 text-center text-xs text-slate-500 dark:text-slate-400">
                Loading tickets...
              </div>
            ) : (
              <div className="w-full min-w-0 overflow-x-auto">
                <MyTickets tickets={tickets} />
              </div>
            )}
          </div>

          <div className="min-w-0 overflow-hidden">
            <FAQSection />
          </div>

        </div>

        <div className="mt-4 sm:mt-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3.5 sm:p-4 text-center shadow-sm">

          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Need more help?
          </p>

          <p className="mt-1 text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
            Our support team is available to assist you with
            loans, payments, EMI schedules and account issues.
          </p>

        </div>

      </div>

      {showCreateTicket && (
        <CreateTicket
          onClose={() => setShowCreateTicket(false)}
          onSubmit={handleCreateTicket}
        />
      )}

    </div>
  );
};

export default HelpSupport;