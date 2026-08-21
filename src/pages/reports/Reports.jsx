import { useEffect, useState } from "react";

import ReportCards from "../../components/reports/ReportCards";
import ReportsTable from "../../components/reports/ReportsTable";
import LoanStatusChart from "../../components/charts/LoanStatusChart";

import { getReportData } from "../../services/reportService";
import { hasPermission } from "../../utils/auth";

const Reports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const canView = hasPermission("VIEW_REPORTS");

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      const data = await getReportData();
      setReport(data);
    } catch (error) {
      console.error("Failed to load reports:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!canView) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-slate-800">
          Access Denied
        </h1>

        <p className="text-slate-500 mt-2">
          You do not have permission to view reports.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-20 text-slate-500">
        Loading reports...
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-20 text-red-500">
        Failed to load reports.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Reports
        </h1>

        <p className="text-slate-500 mt-1">
          System Summary Report
        </p>
      </div>

      {/* Summary Cards */}
      <ReportCards data={report} />

      {/* Loan Status Chart */}
      <LoanStatusChart loans={report.loans} />

      {/* Recent Payments */}
      <ReportsTable payments={report.recentPayments} />
    </div>
  );
};

export default Reports;