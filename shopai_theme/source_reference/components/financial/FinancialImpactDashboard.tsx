import React, { useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  AlertTriangle,
  PieChart as PieChartIcon,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  BarChart3,
  Briefcase,
  Layers,
  Crown,
  Lock,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useApp } from '../../context/AppContext';

export const FinancialImpactDashboard: React.FC = () => {
  const {
    employees,
    totalFinancialExposureINR,
    highRiskCount,
    totalCount,
    setActiveTab,
    activeRole,
    setActiveRole,
    currentUser,
  } = useApp();

  const isHigherAuthority = activeRole === 'Executive / Higher Authority' || activeRole === 'HR Admin';

  if (!isHigherAuthority) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-500/5 via-slate-900/40 to-slate-900/80 p-8 sm:p-12 text-center max-w-3xl mx-auto shadow-2xl backdrop-blur-md">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-5 shadow-lg shadow-amber-500/10">
            <Lock className="h-8 w-8 text-amber-500" />
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
            <Crown className="h-3.5 w-3.5" />
            Higher Authority Clearance Required
          </span>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Executive Financial Risk & Turnover Exposure Gate
          </h2>

          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Your current operational role (<span className="font-semibold text-slate-900 dark:text-slate-200">{activeRole}</span>) is restricted from viewing organization-wide turnover liability, departmental compensation exposure, and executive capital ROI models.
          </p>

          <div className="mt-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-left max-w-lg mx-auto space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              Information Governance Policy
            </div>
            <p className="text-[11px] leading-relaxed">
              In accordance with enterprise data protection and SHOP AI governance, only C-Suite / Executive Board members and certified HR Administrators may access fiscal exposure dossiers.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setActiveRole('Executive / Higher Authority')}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all"
            >
              <Crown className="h-4 w-4" />
              Elevate to Higher Authority Session (Demo)
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            >
              Return to General Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalExposureCr = (totalFinancialExposureINR / 10000000).toFixed(2);
  const totalEmployeesCount = totalCount;

  // Replacement cost components (Industry 1.5x salary standard)
  const replacementBreakdown = [
    { name: 'Recruitment & Agency Fees (30%)', value: 30, color: '#4f46e5' },
    { name: 'Productivity Loss / Ramp-up Dip (40%)', value: 40, color: '#f43f5e' },
    { name: 'Onboarding & Knowledge Transfer (15%)', value: 15, color: '#f59e0b' },
    { name: 'Vacancy Downtime & Overtime Cover (15%)', value: 15, color: '#0ea5e9' },
  ];

  // Department-wise financial risk
  const departmentFinancialRisk = useMemo(() => {
    const depts = ['Engineering', 'Product', 'Sales', 'Marketing', 'Human Resources', 'Operations'];
    return depts.map((d) => {
      const deptEmployees = employees.filter((e) => e.department === d);
      const highRiskEmployees = deptEmployees.filter((e) => e.riskLevel === 'high');
      const exposureINR = highRiskEmployees.reduce(
        (sum, e) => sum + Math.round(e.monthlySalary * 12 * 1.5),
        0
      );
      const retentionProgramCostINR = Math.round(exposureINR * 0.14);
      const projectedSavingsINR = Math.round(exposureINR * 0.62);

      return {
        department: d === 'Human Resources' ? 'HR' : d,
        fullName: d,
        exposureCr: Math.round((exposureINR / 10000000) * 100) / 100,
        programCostLakhs: Math.round(retentionProgramCostINR / 100000),
        savingsCr: Math.round((projectedSavingsINR / 10000000) * 100) / 100,
        highRiskCount: highRiskEmployees.length,
      };
    }).sort((a, b) => b.exposureCr - a.exposureCr);
  }, [employees]);

  // Overall Financial Aggregations
  const totalProgramCostINR = Math.round(totalFinancialExposureINR * 0.14);
  const totalProjectedSavingsINR = Math.round(totalFinancialExposureINR * 0.62);
  const netTurnoverBenefitINR = totalProjectedSavingsINR - totalProgramCostINR;
  const overallROI = Math.round((netTurnoverBenefitINR / totalProgramCostINR) * 100);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <TrendingUp className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Financial Impact & Retention ROI Dashboard
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Cost-of-turnover exposure models, intervention program budgets, and executive return on investment (ROI)
          </p>
        </div>

        <button
          onClick={() => setActiveTab('simulator')}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition-colors self-start sm:self-auto"
        >
          Model Savings in Simulator
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 4 Big Executive Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-rose-200 bg-white p-5 shadow-2xs dark:border-rose-900/60 dark:bg-slate-900">
          <div className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Total Attrition Risk Exposure
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            ₹{totalExposureCr} Cr
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cumulative replacement cost for {highRiskCount} high-risk staff
          </p>
        </div>

        <div className="rounded-2xl border border-indigo-200 bg-white p-5 shadow-2xs dark:border-indigo-900/60 dark:bg-slate-900">
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Retention Program Investment
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            ₹{(totalProgramCostINR / 10000000).toFixed(2)} Cr
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Market corrections, training stipends & workload caps
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-2xs dark:border-emerald-900/60 dark:bg-slate-900">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Net Estimated Savings
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            ₹{(netTurnoverBenefitINR / 10000000).toFixed(2)} Cr
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Turnover avoided minus intervention program outlay
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-white p-5 shadow-2xs dark:border-blue-900/60 dark:bg-slate-900">
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Calculated Strategy ROI
          </div>
          <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
            {overallROI}%
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ₹3.42 return realized per ₹1.00 invested in retention
          </p>
        </div>
      </div>

      {/* Charts Row: Department Financial Risk + Cost Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department-wise Financial Risk Exposure */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Department-Wise Financial Risk vs Projected Savings
              </h3>
              <p className="text-xs text-slate-500">
                Turnover financial exposure (₹ Cr) alongside potential savings through AI interventions
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-rose-500 font-medium">
                <span className="h-2 w-2 rounded-full bg-rose-500" /> Exposure
              </span>
              <span className="flex items-center gap-1 text-emerald-500 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Projected Savings
              </span>
            </div>
          </div>

          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentFinancialRisk}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="department" tick={{ fontSize: 11 }} />
                <YAxis unit=" Cr" tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any, name: any) => [`₹${val} Cr`, name]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="exposureCr" name="Exposure" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="savingsCr" name="Projected Savings" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost of Employee Replacement Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Replacement Cost Architecture
            </h3>
            <p className="text-xs text-slate-500">
              Breakdown of 1.5x annual compensation replacement cost formula
            </p>
          </div>

          <div className="h-52 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={replacementBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {replacementBreakdown.map((entry, index) => (
                    <Cell key={`rep-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val}% of total replacement cost`, '']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            {replacementBreakdown.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 dark:text-slate-300 text-[11px] truncate max-w-[190px]">
                    {item.name}
                  </span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Executive ROI Matrix Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="text-sm font-bold text-slate-900 dark:text-white mb-1">
          Departmental Investment & Capital Allocation Matrix
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Recommended budget distribution to capture maximum retention efficiency
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/40 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3">Business Unit</th>
                <th className="py-3 px-3">High Risk Count</th>
                <th className="py-3 px-3">Financial Exposure</th>
                <th className="py-3 px-3">Retention Budget Required</th>
                <th className="py-3 px-3">Gross Avoided Loss</th>
                <th className="py-3 px-3 text-right">Target ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {departmentFinancialRisk.map((row) => (
                <tr key={row.department} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                    {row.fullName}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-rose-600 dark:text-rose-400">
                      {row.highRiskCount} employees
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                    ₹{row.exposureCr} Cr
                  </td>
                  <td className="py-3 px-3 text-indigo-600 dark:text-indigo-400 font-medium">
                    ₹{row.programCostLakhs} Lakhs
                  </td>
                  <td className="py-3 px-3 font-semibold text-emerald-600 dark:text-emerald-400">
                    ₹{row.savingsCr} Cr
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                      +340%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
