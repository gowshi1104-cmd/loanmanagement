import React, { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

const FAQ_DATA = [
  {
    question: "How do I create a loan?",
    answer:
      "Open the Loans section, select Add Loan, enter the customer and loan details, upload the required documents and submit the application.",
  },
  {
    question: "How do I make an EMI payment?",
    answer:
      "Open the payment section, select the eligible approved loan and proceed with the available payment method.",
  },
  {
    question: "How can I view the EMI schedule?",
    answer:
      "Open the required loan and select the EMI Schedule option to view the upcoming and completed EMI details.",
  },
  {
    question: "Why is my loan still pending?",
    answer:
      "A loan remains pending until it is reviewed and approved or rejected by the authorized user.",
  },
  {
    question: "How can I download my payment receipt?",
    answer:
      "After a successful payment, the receipt can be generated from the payment history.",
  },
  {
    question: "How can I report a technical issue?",
    answer:
      "Use Raise a Support Ticket, select Technical as the issue type and provide a clear description of the problem.",
  },
];

const FAQSection = ({ search }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const filteredFaqs = useMemo(() => {
    const value = search?.trim().toLowerCase();

    if (!value) {
      return FAQ_DATA;
    }

    return FAQ_DATA.filter(
      (item) =>
        item.question.toLowerCase().includes(value) ||
        item.answer.toLowerCase().includes(value)
    );
  }, [search]);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
      <div className="border-b border-slate-200 dark:border-slate-700 px-4 py-3.5 sm:px-5 sm:py-4">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
          Frequently Asked Questions
        </h2>

        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
          Quick answers to common questions.
        </p>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {filteredFaqs.length === 0 ? (
          <div className="px-4 py-8 text-center sm:px-5">
            <Search
              size={20}
              className="mx-auto text-slate-300 dark:text-slate-600"
            />

            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              No matching help topics found.
            </p>
          </div>
        ) : (
          filteredFaqs.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={item.question}>
                <button
                  type="button"
                  onClick={() =>
                    setOpenIndex(isOpen ? null : index)
                  }
                  className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 sm:gap-4 sm:px-5"
                >
                  <span className="min-w-0 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {item.question}
                  </span>

                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-slate-400 dark:text-slate-500 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pr-8 sm:px-5 sm:pr-10">
                    <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FAQSection;