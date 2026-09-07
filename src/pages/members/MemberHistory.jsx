import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import PaymentHistoryTable from "../../components/members/PaymentHistoryTable";

import {
  ArrowLeft,
  User,
  Phone,
  Users,
  Wallet,
  CreditCard,
  IndianRupee,
  Calendar,
  Clock,
  ReceiptText,
  History,
  Download,
} from "lucide-react";

import toast from "react-hot-toast";

import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";

import { getMemberHistory } from "../../services/memberHistoryService";

const MemberHistory = () => {

  const { customerId } = useParams();

  const navigate = useNavigate();

  const [history, setHistory] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    fetchHistory();

  }, [customerId]);

  const fetchHistory = async () => {

    try {

      setLoading(true);

      const data = await getMemberHistory(customerId);

      setHistory(data);

    } catch (error) {

      console.error("Member history error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to load member history",
      );

    } finally {

      setLoading(false);

    }

  };

  // =========================================================
  // PDF CURRENCY
  //
  // IMPORTANT:
  // Do NOT use ₹ inside jsPDF default Helvetica font.
  // It causes broken/spaced characters in PDF.
  // =========================================================

  const formatPdfCurrency = (value) => {

    const amount = Number(value || 0);

    return `Rs. ${amount.toLocaleString("en-IN", {

      minimumFractionDigits: 2,

      maximumFractionDigits: 2,

    })}`;

  };

  // =========================================================
  // PDF PAGE NUMBER
  // =========================================================

  const addPdfFooter = (doc) => {

    const totalPages = doc.internal.getNumberOfPages();

    for (let page = 1; page <= totalPages; page++) {

      doc.setPage(page);

      const pageWidth = doc.internal.pageSize.getWidth();

      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setFont("helvetica", "normal");

      doc.setFontSize(8);

      doc.text(
        `Member History - ${history?.customerId || ""}`,
        14,
        pageHeight - 10,
      );

      const pageText = `Page ${page} of ${totalPages}`;

      const pageTextWidth =
        doc.getTextWidth(pageText);

      doc.text(
        pageText,
        pageWidth - pageTextWidth - 14,
        pageHeight - 10,
      );

    }

  };

  // =========================================================
  // DOWNLOAD MEMBER HISTORY PDF
  // =========================================================

  const handleDownloadPDF = () => {

    if (!history) {

      toast.error("Member history not available");

      return;

    }

    try {

      const doc = new jsPDF({

        orientation: "portrait",

        unit: "mm",

        format: "a4",

      });

      // =====================================================
      // PDF CONSTANTS
      // =====================================================

      const pageHeight =
        doc.internal.pageSize.getHeight();

      const bottomMargin = 25;

      // =====================================================
      // TITLE
      // =====================================================

      doc.setFont("helvetica", "bold");

      doc.setFontSize(20);

      doc.text(
        "Member History",
        14,
        20,
      );

      doc.setFont("helvetica", "normal");

      doc.setFontSize(10);

      doc.text(
        "Complete loan and payment history",
        14,
        27,
      );

      // =====================================================
      // MEMBER DETAILS
      // =====================================================

      doc.setFont("helvetica", "bold");

      doc.setFontSize(13);

      doc.text(
        "Member Details",
        14,
        40,
      );

      autoTable(doc, {

        startY: 44,

        theme: "grid",

        head: [
          ["Field", "Details"],
        ],

        body: [

          [
            "Customer ID",
            history.customerId || "-",
          ],

          [
            "Name",
            history.customerName || "-",
          ],

          [
            "Phone",
            history.phone || "-",
          ],

          [
            "Group",
            history.groupName || "-",
          ],

          [
            "Status",
            history.memberStatus || "-",
          ],

        ],

        styles: {

          font: "helvetica",

          fontSize: 9,

          cellPadding: 3,

          textColor: [60, 60, 60],

        },

        headStyles: {

          font: "helvetica",

          fontStyle: "bold",

          fontSize: 9,

        },

        columnStyles: {

          0: {
            cellWidth: 55,
          },

          1: {
            cellWidth: 120,
          },

        },

        margin: {

          left: 14,

          right: 14,

        },

      });

      // =====================================================
      // SUMMARY
      // =====================================================

      let currentY =
        doc.lastAutoTable.finalY + 12;

      // Page protection

      if (
        currentY >
        pageHeight - bottomMargin
      ) {

        doc.addPage();

        currentY = 20;

      }

      doc.setFont("helvetica", "bold");

      doc.setFontSize(13);

      doc.text(
        "Summary",
        14,
        currentY,
      );

      autoTable(doc, {

        startY: currentY + 4,

        theme: "grid",

        head: [
          ["Summary", "Value"],
        ],

        body: [

          [
            "Total Loans",
            String(history.totalLoans ?? 0),
          ],

          [
            "Total Loan Amount",
            formatPdfCurrency(
              history.totalLoanAmount,
            ),
          ],

          [
            "Total Paid Amount",
            formatPdfCurrency(
              history.totalPaidAmount,
            ),
          ],

          [
            "Total Due Amount",
            formatPdfCurrency(
              history.totalDueAmount,
            ),
          ],

          [
            "Total Overdue Amount",
            formatPdfCurrency(
              history.totalOverdueAmount,
            ),
          ],

        ],

        styles: {

          font: "helvetica",

          fontSize: 9,

          cellPadding: 3,

          textColor: [60, 60, 60],

        },

        headStyles: {

          font: "helvetica",

          fontStyle: "bold",

          fontSize: 9,

        },

        columnStyles: {

          0: {
            cellWidth: 90,
          },

          1: {
            cellWidth: 85,
          },

        },

        margin: {

          left: 14,

          right: 14,

        },

      });

      // =====================================================
      // LOAN HISTORY HEADING
      //
      // IMPORTANT:
      // Don't overwrite currentY inside forEach from
      // doc.lastAutoTable.finalY before printing heading.
      // =====================================================

      currentY =
        doc.lastAutoTable.finalY + 12;

      if (
        currentY >
        pageHeight - bottomMargin
      ) {

        doc.addPage();

        currentY = 20;

      }

      doc.setFont("helvetica", "bold");

      doc.setFontSize(13);

      doc.text(
        "Loan History",
        14,
        currentY,
      );

      // Move below Loan History heading

      currentY += 8;

      // =====================================================
      // LOANS
      // =====================================================

      if (
        !history.loans ||
        history.loans.length === 0
      ) {

        doc.setFont("helvetica", "normal");

        doc.setFontSize(9);

        doc.text(
          "No loans found for this member.",
          14,
          currentY,
        );

      } else {

        history.loans.forEach(
          (loan, loanIndex) => {

            // =================================================
            // PAGE CHECK BEFORE LOAN
            // =================================================

            if (
              currentY >
              pageHeight - bottomMargin
            ) {

              doc.addPage();

              currentY = 20;

            }

            // =================================================
            // LOAN ID
            // =================================================

            doc.setFont("helvetica", "bold");

            doc.setFontSize(11);

            doc.text(
              `Loan ID: ${loan.loanId || "-"}`,
              14,
              currentY,
            );

            // =================================================
            // LOAN DETAILS
            // =================================================

            autoTable(doc, {

              startY: currentY + 3,

              theme: "grid",

              head: [
                ["Field", "Value"],
              ],

              body: [

                [
                  "Loan Amount",
                  formatPdfCurrency(
                    loan.loanAmount,
                  ),
                ],

                [
                  "Interest Rate",
                  `${loan.interestRate ?? 0}%`,
                ],

                [
                  "Tenure",
                  `${loan.tenureMonths ?? 0} Months`,
                ],

                [
                  "EMI Amount",
                  formatPdfCurrency(
                    loan.emiAmount,
                  ),
                ],

                [
                  "Loan Date",
                  loan.loanDate || "-",
                ],

                [
                  "Next EMI Date",
                  loan.nextEmiDate || "-",
                ],

                [
                  "Loan Status",
                  loan.loanStatus || "-",
                ],

                [
                  "Paid EMIs",
                  String(
                    loan.paidEmis ?? 0,
                  ),
                ],

                [
                  "Remaining EMIs",
                  String(
                    loan.remainingEmis ?? 0,
                  ),
                ],

                [
                  "Total Paid",
                  formatPdfCurrency(
                    loan.totalPaidAmount,
                  ),
                ],

                [
                  "Total Due",
                  formatPdfCurrency(
                    loan.totalDueAmount,
                  ),
                ],

                [
                  "Overdue",
                  formatPdfCurrency(
                    loan.overdueAmount,
                  ),
                ],

              ],

              styles: {

                font: "helvetica",

                fontSize: 8,

                cellPadding: 2.5,

                textColor: [60, 60, 60],

              },

              headStyles: {

                font: "helvetica",

                fontStyle: "bold",

                fontSize: 8,

              },

              columnStyles: {

                0: {
                  cellWidth: 75,
                },

                1: {
                  cellWidth: 100,
                },

              },

              margin: {

                left: 14,

                right: 14,

              },

            });

            // =================================================
            // PAYMENT HISTORY
            // =================================================

            currentY =
              doc.lastAutoTable.finalY + 8;

            if (
              loan.payments &&
              loan.payments.length > 0
            ) {

              // -----------------------------------------------
              // Page check
              // -----------------------------------------------

              if (
                currentY >
                pageHeight - 60
              ) {

                doc.addPage();

                currentY = 20;

              }

              doc.setFont(
                "helvetica",
                "bold",
              );

              doc.setFontSize(10);

              doc.text(
                "Payment History",
                14,
                currentY,
              );

              // -----------------------------------------------
              // Payment table
              // -----------------------------------------------

              autoTable(doc, {

                startY: currentY + 3,

                theme: "grid",

                head: [

                  [
                    "Payment ID",
                    "Date",
                    "Amount",
                    "Mode",
                    "Status",
                    "Transaction",
                    "Receipt",
                  ],

                ],

                body: loan.payments.map(
                  (payment) => [

                    payment.paymentId ?? "-",

                    payment.paymentDate ||
                      "-",

                    formatPdfCurrency(
                      payment.amount,
                    ),

                    payment.paymentMode ||
                      "-",

                    payment.status || "-",

                    payment.transactionReference ||
                      "-",

                    payment.receiptNumber ||
                      "-",

                  ],
                ),

                styles: {

                  font: "helvetica",

                  fontSize: 7,

                  cellPadding: 2,

                  overflow: "linebreak",

                  textColor: [60, 60, 60],

                },

                headStyles: {

                  font: "helvetica",

                  fontStyle: "bold",

                  fontSize: 7,

                },

                columnStyles: {

                  0: {
                    cellWidth: 20,
                  },

                  1: {
                    cellWidth: 24,
                  },

                  2: {
                    cellWidth: 28,
                  },

                  3: {
                    cellWidth: 24,
                  },

                  4: {
                    cellWidth: 22,
                  },

                  5: {
                    cellWidth: 36,
                  },

                  6: {
                    cellWidth: 25,
                  },

                },

                margin: {

                  left: 14,

                  right: 14,

                },

              });

              currentY =
                doc.lastAutoTable.finalY +
                8;

            }

            // =================================================
            // UPCOMING PAYMENTS
            // =================================================

            if (
              loan.upcomingPayments &&
              loan.upcomingPayments.length >
                0
            ) {

              // -----------------------------------------------
              // Page check
              // -----------------------------------------------

              if (
                currentY >
                pageHeight - 65
              ) {

                doc.addPage();

                currentY = 20;

              }

              doc.setFont(
                "helvetica",
                "bold",
              );

              doc.setFontSize(10);

              doc.text(
                "Upcoming Payments",
                14,
                currentY,
              );

              // -----------------------------------------------
              // Upcoming table
              // -----------------------------------------------

              autoTable(doc, {

                startY: currentY + 3,

                theme: "grid",

                head: [

                  [
                    "EMI Number",
                    "Due Date",
                    "EMI Amount",
                    "Status",
                  ],

                ],

                body:
                  loan.upcomingPayments.map(
                    (payment) => [

                      `EMI ${
                        payment.emiNumber ??
                        "-"
                      }`,

                      payment.dueDate ||
                        "-",

                      formatPdfCurrency(
                        payment.emiAmount,
                      ),

                      payment.status ||
                        "UPCOMING",

                    ],
                  ),

                styles: {

                  font: "helvetica",

                  fontSize: 7,

                  cellPadding: 2.5,

                  textColor: [60, 60, 60],

                },

                headStyles: {

                  font: "helvetica",

                  fontStyle: "bold",

                  fontSize: 7,

                },

                columnStyles: {

                  0: {
                    cellWidth: 35,
                  },

                  1: {
                    cellWidth: 45,
                  },

                  2: {
                    cellWidth: 50,
                  },

                  3: {
                    cellWidth: 50,
                  },

                },

                margin: {

                  left: 14,

                  right: 14,

                },

              });

              currentY =
                doc.lastAutoTable.finalY +
                10;

            }

            // =================================================
            // SPACE BETWEEN LOANS
            // =================================================

            currentY += 4;

            // =================================================
            // IF MORE LOANS REMAIN AND NOT ENOUGH SPACE
            // =================================================

            if (
              loanIndex <
                history.loans.length -
                  1 &&
              currentY >
                pageHeight - 45
            ) {

              doc.addPage();

              currentY = 20;

            }

          },
        );

      }

      // =====================================================
      // FOOTER
      // =====================================================

      addPdfFooter(doc);

      // =====================================================
      // DOWNLOAD
      // =====================================================

      const fileName =
        `Member-History-${
          history.customerId ||
          "member"
        }.pdf`;

      doc.save(fileName);

      toast.success(
        "Member history PDF downloaded",
      );

    } catch (error) {

      console.error(
        "PDF download error:",
        error,
      );

      toast.error(
        "Failed to generate PDF",
      );

    }

  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <div className="flex min-h-[400px] w-full min-w-0 items-center justify-center px-4">

        <div className="text-center text-sm sm:text-base text-gray-500">

          Loading member history...

        </div>

      </div>

    );

  }

  // =========================================================
  // NO HISTORY
  // =========================================================

  if (!history) {

    return (

      <div className="w-full min-w-0 p-4 sm:p-6">

        <button
          onClick={() => navigate(-1)}
          className="mb-4 sm:mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >

          <ArrowLeft size={18} />

          Back

        </button>

        <div className="rounded-xl border bg-white p-6 sm:p-10 text-center">

          <p className="text-sm sm:text-base text-gray-500">

            Member history not found.

          </p>

        </div>

      </div>

    );

  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (

    <div className="w-full min-w-0 space-y-4 sm:space-y-6 p-3 sm:p-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div className="min-w-0">

          <button
            onClick={() => navigate(-1)}
            className="mb-3 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
          >

            <ArrowLeft size={17} />

            Back

          </button>

          <div className="flex items-start sm:items-center gap-3">

            <div className="shrink-0 rounded-xl bg-blue-100 p-2.5 sm:p-3 text-blue-600">

              <History size={24} />

            </div>

            <div className="min-w-0">

              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">

                Member History

              </h1>

              <p className="text-xs sm:text-sm text-gray-500">

                Complete loan and payment history

              </p>

            </div>

          </div>

        </div>

        {/* =================================================
            DOWNLOAD PDF
        ================================================= */}

        <button
          onClick={handleDownloadPDF}
          className="flex w-full md:w-auto items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
        >

          <Download size={18} />

          Download PDF

        </button>

      </div>

      {/* =====================================================
          MEMBER DETAILS
      ===================================================== */}

      <div className="rounded-xl border bg-white p-4 sm:p-6 shadow-sm">

        <div className="mb-5 flex items-center gap-2">

          <User
            size={20}
            className="text-blue-600"
          />

          <h2 className="text-lg font-semibold">

            Member Details

          </h2>

        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-5">

          <DetailItem
            icon={<User size={17} />}
            label="Customer ID"
            value={history.customerId}
          />

          <DetailItem
            icon={<User size={17} />}
            label="Name"
            value={history.customerName}
          />

          <DetailItem
            icon={<Phone size={17} />}
            label="Phone"
            value={history.phone}
          />

          <DetailItem
            icon={<Users size={17} />}
            label="Group"
            value={history.groupName}
          />

          <div>

            <p className="mb-1 text-xs text-gray-500">

              Status

            </p>

            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                history.memberStatus ===
                "ACTIVE"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >

              {history.memberStatus}

            </span>

          </div>

        </div>

      </div>

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-5">

        <SummaryCard
          icon={<CreditCard size={20} />}
          title="Total Loans"
          value={
            history.totalLoans ?? 0
          }
        />

        <SummaryCard
          icon={<Wallet size={20} />}
          title="Total Loan Amount"
          value={formatCurrency(
            history.totalLoanAmount,
          )}
        />

        <SummaryCard
          icon={
            <IndianRupee size={20} />
          }
          title="Total Paid"
          value={formatCurrency(
            history.totalPaidAmount,
          )}
        />

        <SummaryCard
          icon={<Wallet size={20} />}
          title="Total Due"
          value={formatCurrency(
            history.totalDueAmount,
          )}
        />

        <SummaryCard
          icon={<Clock size={20} />}
          title="Overdue"
          value={formatCurrency(
            history.totalOverdueAmount,
          )}
        />

      </div>

      {/* =====================================================
          LOANS
      ===================================================== */}

      <div className="rounded-xl border bg-white shadow-sm">

        <div className="border-b p-4 sm:p-6">

          <div className="flex items-center gap-2">

            <CreditCard
              size={20}
              className="text-blue-600"
            />

            <h2 className="text-lg font-semibold">

              Loan History

            </h2>

          </div>

          <p className="mt-1 text-xs sm:text-sm text-gray-500">

            All loans associated with this
            member

          </p>

        </div>

        <div className="space-y-4 sm:space-y-5 p-4 sm:p-6">

          {history.loans?.length ===
          0 ? (

            <div className="py-10 text-center text-sm sm:text-base text-gray-500">

              No loans found for this
              member.

            </div>

          ) : (

            history.loans?.map((loan) => (

              <LoanCard
                key={loan.loanId}
                loan={loan}
              />

            ))

          )}

        </div>

      </div>

    </div>

  );

};

// =============================================================
// DETAIL ITEM
// =============================================================

const DetailItem = ({
  icon,
  label,
  value,
}) => {

  return (

    <div className="min-w-0">

      <p className="mb-1 flex items-center gap-1 text-xs text-gray-500">

        {icon}

        {label}

      </p>

      <p className="break-words font-medium text-gray-900">

        {value || "-"}

      </p>

    </div>

  );

};

// =============================================================
// SUMMARY CARD
// =============================================================

const SummaryCard = ({
  icon,
  title,
  value,
}) => {

  return (

    <div className="min-w-0 rounded-xl border bg-white p-4 sm:p-5 shadow-sm">

      <div className="mb-3 flex items-center gap-2 text-blue-600">

        {icon}

        <span className="text-xs sm:text-sm text-gray-500">

          {title}

        </span>

      </div>

      <p className="break-words text-lg sm:text-xl font-semibold text-gray-900">

        {value}

      </p>

    </div>

  );

};

// =============================================================
// LOAN CARD
// =============================================================

const LoanCard = ({ loan }) => {

  return (

    <div className="overflow-hidden rounded-xl border">

      {/* -------------------------------------------------
          LOAN HEADER
      ------------------------------------------------- */}

      <div className="flex flex-col gap-3 border-b bg-gray-50 p-4 sm:p-5 md:flex-row md:items-center md:justify-between">

        <div className="min-w-0">

          <p className="text-xs text-gray-500">

            Loan ID

          </p>

          <p className="break-all font-semibold text-gray-900">

            {loan.loanId}

          </p>

        </div>

        <span
          className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
            loan.loanStatus ===
            "APPROVED"
              ? "bg-green-100 text-green-700"
              : loan.loanStatus ===
                  "PENDING"
                ? "bg-yellow-100 text-yellow-700"
                : loan.loanStatus ===
                    "REJECTED"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700"
          }`}
        >

          {loan.loanStatus}

        </span>

      </div>

      {/* -------------------------------------------------
          LOAN DETAILS
      ------------------------------------------------- */}

      <div className="grid grid-cols-1 gap-4 sm:gap-5 p-4 sm:p-5 sm:grid-cols-2 lg:grid-cols-4">

        <LoanDetail
          label="Loan Amount"
          value={formatCurrency(
            loan.loanAmount,
          )}
        />

        <LoanDetail
          label="Interest Rate"
          value={`${loan.interestRate ?? 0}%`}
        />

        <LoanDetail
          label="Tenure"
          value={`${loan.tenureMonths ?? 0} Months`}
        />

        <LoanDetail
          label="EMI Amount"
          value={formatCurrency(
            loan.emiAmount,
          )}
        />

        <LoanDetail
          label="Loan Date"
          value={loan.loanDate}
        />

        <LoanDetail
          label="Next EMI Date"
          value={loan.nextEmiDate}
        />

        <LoanDetail
          label="Paid EMIs"
          value={loan.paidEmis ?? 0}
        />

        <LoanDetail
          label="Remaining EMIs"
          value={
            loan.remainingEmis ?? 0
          }
        />

        <LoanDetail
          label="Total Paid"
          value={formatCurrency(
            loan.totalPaidAmount,
          )}
        />

        <LoanDetail
          label="Total Due"
          value={formatCurrency(
            loan.totalDueAmount,
          )}
        />

        <LoanDetail
          label="Overdue"
          value={formatCurrency(
            loan.overdueAmount,
          )}
        />

      </div>

      {/* -------------------------------------------------
          UPCOMING PAYMENTS
      ------------------------------------------------- */}

      {loan.upcomingPayments?.length >
        0 && (

        <div className="border-t">

          <div className="border-b px-4 sm:px-5 py-4">

            <div className="flex items-center gap-2">

              <Calendar
                size={18}
                className="text-blue-600"
              />

              <h3 className="font-semibold text-gray-900">

                Upcoming Payments

              </h3>

            </div>

            <p className="mt-1 text-xs sm:text-sm text-gray-500">

              Upcoming EMI payment schedule
              for this loan

            </p>

          </div>

          <div className="overflow-x-auto p-3 sm:p-5">

            <table className="w-full min-w-[650px] text-left">

              <thead className="bg-gray-50">

                <tr className="border-b text-xs uppercase text-gray-500">

                  <th className="px-5 py-3 whitespace-nowrap">
                    EMI Number
                  </th>

                  <th className="px-5 py-3 whitespace-nowrap">
                    Due Date
                  </th>

                  <th className="px-5 py-3 whitespace-nowrap">
                    EMI Amount
                  </th>

                  <th className="px-5 py-3 whitespace-nowrap">
                    Status
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y">

                {loan.upcomingPayments.map(
                  (payment) => (

                    <tr
                      key={
                        payment.emiNumber
                      }
                      className="hover:bg-gray-50"
                    >

                      <td className="px-5 py-4 font-medium text-gray-900 whitespace-nowrap">

                        EMI{" "}

                        {
                          payment.emiNumber
                        }

                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">

                        {payment.dueDate ||
                          "-"}

                      </td>

                      <td className="px-5 py-4 font-semibold text-gray-900 whitespace-nowrap">

                        {formatCurrency(
                          payment.emiAmount,
                        )}

                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">

                        <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">

                          {payment.status ||
                            "UPCOMING"}

                        </span>

                      </td>

                    </tr>

                  ),
                )}

              </tbody>

            </table>

          </div>

        </div>

      )}

      {/* -------------------------------------------------
          PAYMENTS
      ------------------------------------------------- */}

      <div className="border-t">

        <div className="border-b px-4 sm:px-5 py-4">

          <div className="flex items-center gap-2">

            <ReceiptText
              size={18}
              className="text-blue-600"
            />

            <h3 className="font-semibold text-gray-900">

              Payment History

            </h3>

          </div>

          <p className="mt-1 text-xs sm:text-sm text-gray-500">

            All payment transactions for this
            loan

          </p>

        </div>

        <div className="overflow-x-auto p-3 sm:p-5">

          <PaymentHistoryTable
            payments={
              loan.payments || []
            }
          />

        </div>

      </div>

    </div>

  );

};

// =============================================================
// LOAN DETAIL
// =============================================================

const LoanDetail = ({
  label,
  value,
}) => {

  return (

    <div className="min-w-0">

      <p className="mb-1 text-xs text-gray-500">

        {label}

      </p>

      <p className="break-words font-medium text-gray-900">

        {value || "-"}

      </p>

    </div>

  );

};

// =============================================================
// UI CURRENCY
// =============================================================

const formatCurrency = (value) => {

  const amount = Number(value || 0);

  return `₹${amount.toLocaleString(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  )}`;

};

export default MemberHistory;