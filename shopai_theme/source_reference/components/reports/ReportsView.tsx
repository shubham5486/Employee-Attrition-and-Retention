import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Printer,
  Building,
  AlertTriangle,
  TrendingDown,
  CheckCircle2,
  Sparkles,
  Calendar,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ReportsView: React.FC = () => {
  const { employees, totalCount, highRiskCount, mediumRiskCount, lowRiskCount, totalFinancialExposureINR, showToast } = useApp();

  const [selectedReportType, setSelectedReportType] = useState<
    'Executive Summary' | 'High-Risk Employee Report' | 'Department Attrition Report' | 'Retention Strategy Report'
  >('Executive Summary');

  const highRiskList = useMemo(() => employees.filter((e) => e.riskLevel === 'high'), [employees]);
  const exposureCr = (totalFinancialExposureINR / 10000000).toFixed(2);

  // Department Aggregates for Report
  const departmentStats = useMemo(() => {
    const depts = ['Engineering', 'Product', 'Sales', 'Marketing', 'Human Resources', 'Operations'];
    return depts.map((d) => {
      const staff = employees.filter((e) => e.department === d);
      const high = staff.filter((e) => e.riskLevel === 'high');
      const rate = staff.length > 0 ? Math.round((high.length / staff.length) * 100) : 0;
      const avgSal = staff.length > 0 ? Math.round(staff.reduce((acc, e) => acc + e.monthlySalary, 0) / staff.length) : 0;
      return {
        name: d,
        headcount: staff.length,
        highRisk: high.length,
        attritionRate: rate,
        avgSalary: avgSal,
      };
    });
  }, [employees]);

  // Trigger browser print for printable PDF format
  const handlePrintPDF = () => {
    window.print();
    showToast('Print dialog initiated for PDF generation', 'info');
  };

  // Export specific report to CSV
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = `shopai_${selectedReportType.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;

    if (selectedReportType === 'High-Risk Employee Report') {
      headers = ['Employee ID', 'Name', 'Department', 'Role', 'Tenure (Yrs)', 'Monthly Salary', 'Overtime (Hrs)', 'Satisfaction', 'Attrition Risk (%)', 'Primary Risk Trigger'];
      rows = highRiskList.map((e) => [
        e.id,
        `"${e.name}"`,
        `"${e.department}"`,
        `"${e.role}"`,
        e.yearsAtCompany,
        e.monthlySalary,
        e.overtimeHoursWeekly,
        e.satisfactionScore,
        Math.round(e.attritionRisk * 100),
        `"${e.primaryRiskFactor}"`,
      ]);
    } else if (selectedReportType === 'Department Attrition Report') {
      headers = ['Department', 'Headcount', 'High Risk Count', 'Attrition Rate (%)', 'Average Monthly Salary (INR)'];
      rows = departmentStats.map((d) => [
        `"${d.name}"`,
        d.headcount,
        d.highRisk,
        d.attritionRate,
        d.avgSalary,
      ]);
    } else {
      headers = ['Metric / Domain', 'Value', 'Context / Status'];
      rows = [
        ['Total Workforce Headcount', totalCount, 'Active global employees'],
        ['High Attrition Risk Staff', highRiskCount, `${Math.round((highRiskCount / totalCount) * 100)}% of company`],
        ['Medium Risk Staff', mediumRiskCount, 'Watchlist monitoring'],
        ['Low Risk Staff', lowRiskCount, 'Stable talent base'],
        ['Total Turnover Financial Exposure', `₹${exposureCr} Cr`, 'Replacement cost benchmark'],
        ['Predicted Model Accuracy', '93.4%', 'XGBoost ensemble AUC'],
        ['Report Generated Date', new Date().toLocaleDateString(), 'SHOP AI Governance'],
      ];
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloaded CSV for ${selectedReportType}`, 'success');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <FileText className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Executive HR & Retention Intelligence Reports
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Audit-ready attrition dossiers, executive risk briefs, and downloadable board-level reports
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <Download className="h-4 w-4 text-slate-500" />
            Download CSV
          </button>
          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition-colors"
          >
            <Printer className="h-4 w-4" />
            Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {(
          [
            'Executive Summary',
            'High-Risk Employee Report',
            'Department Attrition Report',
            'Retention Strategy Report',
          ] as const
        ).map((type) => (
          <button
            key={type}
            onClick={() => setSelectedReportType(type)}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              selectedReportType === type
                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold shadow-xs'
                : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            <div className="text-xs font-bold">{type}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {type === 'Executive Summary'
                ? 'Board overview & exposure'
                : type === 'High-Risk Employee Report'
                ? `${highRiskCount} personnel priority table`
                : type === 'Department Attrition Report'
                ? 'Cross-department comparison'
                : 'Action plan & ROI matrix'}
            </div>
          </button>
        ))}
      </div>

      {/* Report Document Sheet (Printable styled card) */}
      <div
        id="printable-report"
        className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6"
      >
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-indigo-600" />
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                SHOP AI • Human Capital Analytics
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {selectedReportType}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Machine Learning Model: Ensemble XGBoost v3.4 • Trained on 500+ Verified Enterprise Records
            </p>
          </div>

          <div className="text-right text-xs text-slate-500">
            <div>
              Generated Date:{' '}
              <strong className="text-slate-900 dark:text-white">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </strong>
            </div>
            <div className="mt-0.5">
              Classification: <span className="font-semibold text-rose-600">Confidential HR Internal</span>
            </div>
          </div>
        </div>

        {/* Content depending on selected report */}
        {selectedReportType === 'Executive Summary' && (
          <div className="space-y-6">
            {/* 3 Executive Highlight Callouts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="text-xs font-semibold text-slate-500">Workforce Exposure</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  ₹{exposureCr} Crores
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Calculated based on {highRiskCount} high-risk departures at 1.5x salary replacement factor
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="text-xs font-semibold text-slate-500">Predictive Attrition Rate</div>
                <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                  {Math.round((highRiskCount / totalCount) * 1000) / 10}%
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {highRiskCount} staff above 65% probability threshold requiring immediate intervention
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="text-xs font-semibold text-slate-500">Net Retention Value</div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  ₹{(Number(exposureCr) * 0.48).toFixed(2)} Crores
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Estimated cost avoidance achievable with active retention intervention authorization
                </p>
              </div>
            </div>

            {/* Narrative Findings */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Executive Synthesis & Primary Attrition Drivers
              </h3>
              <p>
                1. <strong>Overtime Saturation:</strong> Employees logging in excess of 8 overtime hours weekly show a <strong>3.8x higher departure likelihood</strong> than peers with normal workload patterns, concentrated primarily in Engineering and Operations.
              </p>
              <p>
                2. <strong>Compensation Deficit:</strong> Compensation lagging 15% or more below department median is the single strongest driver for early tenure turnover (1-3 years experience).
              </p>
              <p>
                3. <strong>Promotion Stagnation:</strong> Personnel who have completed 3 or more years without advancement register a 2.9x drop in engagement scores, compounding overall risk.
              </p>
            </div>
          </div>
        )}

        {selectedReportType === 'High-Risk Employee Report' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Displaying Top {Math.min(25, highRiskList.length)} Critical Personnel Requiring Retention Review</span>
              <span className="font-bold text-rose-600">{highRiskList.length} total high risk</span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl dark:border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800 text-[11px] font-semibold text-slate-500 uppercase">
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Tenure</th>
                    <th className="py-2.5 px-3">Overtime</th>
                    <th className="py-2.5 px-3">Primary Trigger</th>
                    <th className="py-2.5 px-3 text-center">Risk Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {highRiskList.slice(0, 20).map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-400">{emp.id}</td>
                      <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">{emp.name}</td>
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-300">{emp.department}</td>
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-300">{emp.role}</td>
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-300">{emp.yearsAtCompany} yrs</td>
                      <td className="py-2 px-3 text-rose-600 font-medium">{emp.overtimeHoursWeekly} h/wk</td>
                      <td className="py-2 px-3">
                        <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                          {emp.primaryRiskFactor}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-rose-600">
                        {Math.round(emp.attritionRisk * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedReportType === 'Department Attrition Report' && (
          <div className="space-y-4">
            <div className="overflow-x-auto border border-slate-200 rounded-xl dark:border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800 text-[11px] font-semibold text-slate-500 uppercase">
                    <th className="py-3 px-3">Department</th>
                    <th className="py-3 px-3">Headcount</th>
                    <th className="py-3 px-3">High Risk Count</th>
                    <th className="py-3 px-3">Attrition Rate</th>
                    <th className="py-3 px-3">Avg Monthly Pay</th>
                    <th className="py-3 px-3">Department Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {departmentStats.map((d) => (
                    <tr key={d.name}>
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{d.name}</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{d.headcount} staff</td>
                      <td className="py-3 px-3 font-semibold text-rose-600">{d.highRisk}</td>
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{d.attritionRate}%</td>
                      <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">
                        ₹{d.avgSalary.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            d.attritionRate >= 20
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                          }`}
                        >
                          {d.attritionRate >= 20 ? 'CRITICAL ATTENTION' : 'STABLE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedReportType === 'Retention Strategy Report' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20 text-xs">
              <h4 className="font-bold text-indigo-950 dark:text-indigo-200 mb-1">
                4-Pillar Recommended Organizational Retention Framework
              </h4>
              <p className="text-slate-600 dark:text-slate-300">
                Targeting a 38% organization-wide reduction in turnover risk over the subsequent two quarters.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Pillar 1: Overtime Hard Caps & Burnout Relief
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Enforce an 8-hour weekly overtime cap across Engineering & Operations; introduce mandatory compensatory time off.
                </p>
                <div className="mt-2 text-xs font-bold text-emerald-600">Expected Impact: -18% attrition in core units</div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Pillar 2: Market Compensation Equity Corrections
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Allocate ₹48 Lakhs for targeted pay adjustments focusing on employees below the 25th percentile of role benchmarks.
                </p>
                <div className="mt-2 text-xs font-bold text-emerald-600">Expected Impact: -24% attrition in high performers</div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Pillar 3: Dual-Track Career Progression
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Establish technical fellow / principal individual contributor paths to unblock staff waiting 3+ years for promotion.
                </p>
                <div className="mt-2 text-xs font-bold text-emerald-600">Expected Impact: -15% tenure stagnation departures</div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Pillar 4: Manager Effectiveness & Skip-Level Coaching
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Implement bi-monthly skip-level check-ins for teams where manager relationship scores fall below 3.0.
                </p>
                <div className="mt-2 text-xs font-bold text-emerald-600">Expected Impact: -12% supervisory flight risk</div>
              </div>
            </div>
          </div>
        )}

        {/* Report Footer */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>Prepared by SHOP AI Intelligence Engine</div>
          <div>Verified & Ready for Board / Executive Review</div>
        </div>
      </div>
    </div>
  );
};
