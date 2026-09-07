import React from "react";
import {
  Phone,
  Mail,
  MessageSquarePlus,
  ArrowUpRight,
} from "lucide-react";

const SUPPORT_PHONE = "+917402404541";
const SUPPORT_EMAIL = "loanmanagement1199@gmail.com";

const SupportContactCards = ({ onRaiseTicket }) => {
  const emailSubject = encodeURIComponent(
    "Loan Management System - Support Request"
  );

  const emailBody = encodeURIComponent(
    `Hello Support Team,

I need assistance regarding the Loan Management System.

Issue:
    
Thank you.`
  );

  const cards = [
    {
      title: "Call Support",
      description: "Talk directly with our support team.",
      icon: Phone,
      buttonText: "Call Now",
      href: `tel:${SUPPORT_PHONE}`,
    },
    {
      title: "Email Support",
      description: "Send your query directly to our support team.",
      icon: Mail,
      buttonText: "Send Email",
      href: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
        SUPPORT_EMAIL
      )}&su=${emailSubject}&body=${emailBody}`,
      external: true,
    },
    {
      title: "Raise a Ticket",
      description: "Report an issue and track its progress.",
      icon: MessageSquarePlus,
      buttonText: "Raise Ticket",
      onClick: onRaiseTicket,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="group rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <Icon size={19} />
              </div>

              <ArrowUpRight
                size={16}
                className="shrink-0 text-slate-300 dark:text-slate-600 transition group-hover:text-slate-500 dark:group-hover:text-slate-400"
              />
            </div>

            <h3 className="mt-3 break-words text-sm font-bold text-slate-800 dark:text-slate-100">
              {card.title}
            </h3>

            <p className="mt-1 min-h-[38px] text-xs leading-5 text-slate-500 dark:text-slate-400">
              {card.description}
            </p>

            {card.href ? (
              <a
                href={card.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 dark:bg-slate-700 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800 dark:hover:bg-slate-600"
              >
                {card.buttonText}
              </a>
            ) : (
              <button
                type="button"
                onClick={card.onClick}
                className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 dark:bg-slate-700 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800 dark:hover:bg-slate-600"
              >
                {card.buttonText}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SupportContactCards;