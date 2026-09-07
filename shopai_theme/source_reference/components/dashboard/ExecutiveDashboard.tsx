import React, { useMemo } from 'react';
import {
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Users,
  ShieldAlert,
  ShieldCheck,
  Award,
  ArrowRight,
  Download,
  Sliders,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Flame,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
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
  AreaChart,
  Area,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { GLOBAL_FEATURE_IMPORTANCE } from '../../ml/engine';
import { Employee } from '../../types';

export const ExecutiveDashboard: React.FC = () => {
  const {
    employees,
    totalCount,
    highRiskCount,
    mediumRiskCount,
    lowRiskCount,
    attritionRatePercent,
    totalFinancialExposureINR,
    savedEmployeesCount,
    retentionSuccessRate,
    setActiveTab,
    selectEmployee,
  } = useApp();

  const exposureCr = (totalFinancialExposureINR / 10000000).toFixed(1);

  // Highest risk priority employees (sorted by risk desc)
  const priorityEmployees = useMemo(() => {
    return [...employees].sort((a, b) => b.attritionRisk - a.attritionRisk).slice(0, 6);
  }, [employees]);

  // Chart data: 12-month attrition trend + projected
  const attritionTrendData = [
    { month: 'Oct 25', actual: 16.2, projected: null, benchmark: 14.0 },
    { month: 'Nov 25', actual: 17.5, projected: null, benchmark: 14.2 },
    { month: 'Dec 25', actual: 19.1, projected: null, benchmark: 14.5 },
    { month: 'Jan 26', actual: 21.4, projected: null, benchmark: 14.8 },
    { month: 'Feb 26', actual: 23.0, projected: null, benchmark: 15.0 },
    { month: 'Mar 26', actual: 24.8, projected: null, benchmark: 15.2 },
    { month: 'Apr 26 (Now)', actual: attritionRatePercent, projected: attritionRatePercent, benchmark: 15.5 },
    { month: 'May 26', actual: null, projected: Math.round((attritionRatePercent + 1.4) * 10) / 10, benchmark: 15.6 },
    { month: 'Jun 26', actual: null, projected: Math.round((attritionRatePercent + 2.8) * 10) / 10, benchmark: 15.8 },
    { month: 'Jul 26', actual: null, projected: Math.round((attritionRatePercent + 4.1) * 10) / 10, benchmark: 16.0 },
    { month: 'Aug 26', actual: null, projected: Math.round((attritionRatePercent + 5.2) * 10) / 10, benchmark: 16.2 },
    { month: 'Sep 26', actual: null, projected: Math.round((attritionRatePercent + 6.0) * 10) / 10, benchmark: 16.3 },
  ];

  // Attrition by department
  const departmentChartData = useMemo(() => {
    const depts = ['Engineering', 'Product', 'Sales', 'Marketing', 'Human Resources', 'Operations'];
    return depts.map((dept) => {
      const deptEmployees = employees.filter((e) => e.department === dept);
      const highRisk = deptEmployees.filter((e) => e.riskLevel === 'high').length;
      const count = deptEmployees.length;
      const rate = count > 0 ? Math.round((highRisk / count) * 1000) / 10 : 0;
      return {
        department: dept === 'Human Resources' ? 'HR' : dept,
        fullName: dept,
        total: count,
        highRisk,
        attritionRate: rate,
      };
    }).sort((a, b) => b.attritionRate - a.attritionRate);
  }, [employees]);

  // Attrition by experience
  const experienceChartData = useMemo(() => {
    const buckets = [
      { range: '0 - 2 yrs', min: 0, max: 2 },
      { range: '3 - 5 yrs', min: 3, max: 5 },
      { range: '6 - 8 yrs', min: 6, max: 8 },
      { range: '9+ yrs', min: 9, max: 99 },
    ];
    return buckets.map((b) => {
      const group = employees.filter((e) => e.yearsAtCompany >= b.min && e.yearsAtCompany <= b.max);
      const highRisk = group.filter((e) => e.riskLevel === 'high').length;
      const rate = group.length > 0 ? Math.round((highRisk / group.length) * 100) : 0;
      return {
        experience: b.range,
        total: group.length,
        highRisk,
        rate,
      };
    });
  }, [employees]);

  // Attrition by salary range
  const salaryChartData = useMemo(() => {
    const bands = [
      { band: '< ₹60k', min: 0, max: 60000 },
      { band: '₹60k - 1L', min: 60000, max: 100000 },
      { band: '₹1L - 1.5L', min: 100000, max: 150000 },
      { band: '₹1.5L - 2L', min: 150000, max: 200000 },
      { band: '₹2L+', min: 200000, max: 9999999 },
    ];
    return bands.map((b) => {
      const group = employees.filter((e) => e.monthlySalary >= b.min && e.monthlySalary < b.max);
      const highRisk = group.filter((e) => e.riskLevel === 'high').length;
      const rate = group.length > 0 ? Math.round((highRisk / group.length) * 100) : 0;
      return {
        salaryBand: b.band,
        total: group.length,
        highRisk,
        attritionRate: rate,
      };
    });
  }, [employees]);

  // Risk distribution donut data
  const riskDonutData = [
    { name: 'High Risk (>65%)', value: highRiskCount, color: '#f43f5e' },
    { name: 'Medium Risk (35-65%)', value: mediumRiskCount, color: '#f59e0b' },
    { name: 'Low Risk (<35%)', value: lowRiskCount, color: '#10b981' },
  ];

  // Attrition by job role (top 6 roles with highest risk)
  const roleChartData = useMemo(() => {
    const roleMap: Record<string, { total: number; high: number }> = {};
    employees.forEach((e) => {
      if (!roleMap[e.role]) roleMap[e.role] = { total: 0, high: 0 };
      roleMap[e.role].total += 1;
      if (e.riskLevel === 'high') roleMap[e.role].high += 1;
    });
    return Object.entries(roleMap)
      .map(([role, stats]) => ({
        role: role.length > 20 ? role.substring(0, 18) + '...' : role,
        fullRole: role,
        total: stats.total,
        high: stats.high,
        rate: stats.total > 0 ? Math.round((stats.high / stats.total) * 100) : 0,
      }))
      .filter((r) => r.total >= 10)
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 6);
  }, [employees]);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP-LEVEL PROMINENT INSIGHT BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-900 via-indigo-950 to-slate-950 p-6 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 h-64 w-64 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-8 h-48 w-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-300 border border-rose-500/30">
              <AlertTriangle className="h-3.5 w-3.5" />
              Critical Enterprise Retention Alert
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              ⚠ {highRiskCount} employees are currently at high attrition risk.
            </h1>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-sm text-slate-300">
              <span>
                Potential annual financial exposure:{' '}
                <strong className="text-rose-400 font-bold text-base">₹{exposureCr} Cr</strong>
              </span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span>
                AI recommends immediate intervention for{' '}
                <strong className="text-amber-400 font-bold text-base">
                  {Math.min(highRiskCount, 121)} employees
                </strong>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setActiveTab('employees')}
              className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-rose-900/30 hover:bg-rose-500 transition-all hover:scale-[1.02]"
            >
              View High-Risk Employees
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white backdrop-blur-md hover:bg-white/20 transition-all border border-white/15"
            >
              <Sliders className="h-4 w-4 text-indigo-300" />
              Run Retention Simulation
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className="flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-white backdrop-blur-md hover:bg-white/20 transition-all border border-white/15"
              title="Generate Risk Report"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Generate Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. STAT KPI CARDS (8 Essential Metrics) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {/* Total Employees */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Headcount</span>
            <div className="rounded-xl bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{totalCount}</span>
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center">
              +4.2% YoY
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Across 6 enterprise business units</p>
        </div>

        {/* High Risk Employees */}
        <div className="rounded-2xl border border-rose-200/80 bg-rose-50/40 p-4 shadow-2xs dark:border-rose-900/50 dark:bg-rose-950/20">
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-400">
            <span className="text-xs font-semibold uppercase tracking-wider">High Risk</span>
            <div className="rounded-xl bg-rose-100 p-2 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-rose-600 dark:text-rose-400">{highRiskCount}</span>
            <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300">
              ({Math.round((highRiskCount / totalCount) * 100)}%)
            </span>
          </div>
          <p className="mt-1 text-[11px] text-rose-600/90 dark:text-rose-400/90 font-medium">
            Attrition probability &gt; 65%
          </p>
        </div>

        {/* Medium Risk */}
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-4 shadow-2xs dark:border-amber-900/50 dark:bg-amber-950/20">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Medium Risk</span>
            <div className="rounded-xl bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400">{mediumRiskCount}</span>
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">
              ({Math.round((mediumRiskCount / totalCount) * 100)}%)
            </span>
          </div>
          <p className="mt-1 text-[11px] text-amber-600/90 dark:text-amber-400/90 font-medium">
            Probability 35% - 65%
          </p>
        </div>

        {/* Low Risk */}
        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-4 shadow-2xs dark:border-emerald-900/50 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Low Risk</span>
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">{lowRiskCount}</span>
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
              ({Math.round((lowRiskCount / totalCount) * 100)}%)
            </span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-600/90 dark:text-emerald-400/90 font-medium">
            Stable retention buffer
          </p>
        </div>

        {/* Predicted Attrition Rate */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Predicted Attrition Rate</span>
            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{attritionRatePercent}%</span>
            <span className="text-[11px] font-medium text-rose-500">+1.8% vs last Q</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Benchmark industry avg: 15.5%</p>
        </div>

        {/* Estimated Financial Risk */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Financial Risk Exposure</span>
            <div className="rounded-xl bg-rose-50 p-2 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-rose-600 dark:text-rose-400">₹{exposureCr} Cr</span>
            <span className="text-[11px] font-medium text-slate-400">Replacement cost</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">1.5x salary replacement standard</p>
        </div>

        {/* Employees Saved Through Interventions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Employees Saved</span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">{savedEmployeesCount}</span>
            <span className="text-[11px] font-medium text-emerald-600">Past 2 Quarters</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Est. ₹3.8 Cr turnover avoided</p>
        </div>

        {/* Retention Success Rate */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Retention Success Rate</span>
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{retentionSuccessRate}%</span>
            <span className="text-[11px] font-medium text-emerald-600">+6.4% YoY</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Post AI-guided interventions</p>
        </div>
      </div>

      {/* 3. AI BUSINESS INSIGHTS PANEL (Dynamic Data-Driven) */}
      <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/70 via-blue-50/40 to-white p-5 dark:border-indigo-900/60 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900 shadow-2xs">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              AI Executive Business Insights
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Live algorithmic synthesis from current organizational telemetry & SHAP attribution
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-xl border border-slate-200/80 bg-white/90 p-3.5 dark:border-slate-800 dark:bg-slate-800/80 shadow-2xs">
            <div className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Departmental Disparity
            </div>
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-1 leading-snug">
              “Engineering has the highest predicted attrition risk at {departmentChartData[0]?.attritionRate || 28.4}%.”
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Driven by intense sprint overtime (&gt;16 hrs/wk) and compensation 14% below tech market medians.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white/90 p-3.5 dark:border-slate-800 dark:bg-slate-800/80 shadow-2xs">
            <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Top Attrition Drivers
            </div>
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-1 leading-snug">
              “The top three risk factors are overtime, compensation, and lack of recent promotion.”
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Together they account for 61.7% of all calculated predictive attrition weight in SHAP values.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white/90 p-3.5 dark:border-slate-800 dark:bg-slate-800/80 shadow-2xs">
            <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Targeted Opportunity
            </div>
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-1 leading-snug">
              “Targeted interventions could reduce estimated attrition by 18%, saving ~₹2.8 Cr.”
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Simulations indicate compensation realignments and workload caps yield an average 3.8x ROI.
            </p>
          </div>
        </div>
      </div>

      {/* 4. INTERACTIVE CHARTS ROW 1: Trend Over Time & Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attrition Trend Over Time */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Attrition Trend & Forecast Trajectory
              </h3>
              <p className="text-xs text-slate-500">Historical quarterly curve + AI predictive trajectory</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-indigo-600" /> Historical
              </span>
              <span className="flex items-center gap-1.5 text-rose-500 font-medium">
                <span className="h-2 w-2 rounded-full bg-rose-500" /> AI Forecast
              </span>
              <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-slate-300" /> Industry Benchmark
              </span>
            </div>
          </div>

          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attritionTrendData}>
                <defs>
                  <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="projectedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis unit="%" tick={{ fontSize: 11 }} tickLine={false} domain={[0, 40]} />
                <Tooltip
                  formatter={(value: any) => [`${value}%`, 'Attrition Rate']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="actual" stroke="#4f46e5" strokeWidth={2.5} fill="url(#actualGrad)" />
                <Area type="monotone" dataKey="projected" stroke="#f43f5e" strokeWidth={2.5} strokeDasharray="5 5" fill="url(#projectedGrad)" />
                <Line type="monotone" dataKey="benchmark" stroke="#94a3b8" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Donut */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Workforce Risk Distribution
            </h3>
            <p className="text-xs text-slate-500">Employee segmentation by attrition tier</p>
          </div>

          <div className="h-56 relative flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskDonutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val} employees`, 'Count']}
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
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalCount}</span>
              <span className="text-[11px] text-slate-400 font-medium">Headcount</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {riskDonutData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                </div>
                <div className="font-bold text-slate-900 dark:text-white">
                  {item.value} <span className="font-normal text-slate-400 text-[11px]">({Math.round((item.value / totalCount) * 100)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. INTERACTIVE CHARTS ROW 2: Department Attrition & Top SHAP Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attrition by Department */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Attrition Risk by Department
              </h3>
              <p className="text-xs text-slate-500">Percentage of high-risk employees by organizational unit</p>
            </div>
            <button
              onClick={() => setActiveTab('departments')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1"
            >
              Deep Dive <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentChartData} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" unit="%" domain={[0, 45]} tick={{ fontSize: 11 }} />
                <YAxis dataKey="department" type="category" tick={{ fontSize: 11 }} width={80} />
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${val}% high-risk (${item.payload.highRisk} of ${item.payload.total} employees)`,
                    'Attrition Rate',
                  ]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="attritionRate" fill="#4f46e5" radius={[0, 6, 6, 0]} barSize={16}>
                  {departmentChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.attritionRate > 30 ? '#f43f5e' : entry.attritionRate > 20 ? '#f59e0b' : '#4f46e5'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Global SHAP Factors */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Global Attrition Drivers (SHAP Importance)
              </h3>
              <p className="text-xs text-slate-500">Machine learning feature contribution to departure predictions</p>
            </div>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              XGBoost Model
            </span>
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={GLOBAL_FEATURE_IMPORTANCE} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" tickFormatter={(v) => `${Math.round(v * 100)}%`} domain={[0, 0.3]} tick={{ fontSize: 11 }} />
                <YAxis dataKey="feature" type="category" tick={{ fontSize: 10 }} width={160} />
                <Tooltip
                  formatter={(val: any) => [`${(val * 100).toFixed(1)}% predictive weight`, 'Feature Importance']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="importance" radius={[0, 6, 6, 0]} barSize={14}>
                  {GLOBAL_FEATURE_IMPORTANCE.map((entry, index) => (
                    <Cell
                      key={`shap-${index}`}
                      fill={entry.impactDirection === 'Increases Attrition' ? '#f43f5e' : '#10b981'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 6. INTERACTIVE CHARTS ROW 3: Experience & Salary Range */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attrition by Tenure / Experience */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Attrition Risk by Tenure Experience
            </h3>
            <p className="text-xs text-slate-500">Risk vulnerability peak occurs at 3-5 years (burnout & promotion gap)</p>
          </div>

          <div className="h-60 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={experienceChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="experience" tick={{ fontSize: 11 }} />
                <YAxis unit="%" tick={{ fontSize: 11 }} domain={[0, 60]} />
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${val}% (${item.payload.highRisk} of ${item.payload.total} staff)`,
                    'Attrition Rate',
                  ]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="rate" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attrition by Salary Band */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Attrition Risk by Monthly Compensation Band
            </h3>
            <p className="text-xs text-slate-500">Substantially higher turnover pressure in lower-to-median salary brackets</p>
          </div>

          <div className="h-60 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salaryChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="salaryBand" tick={{ fontSize: 11 }} />
                <YAxis unit="%" tick={{ fontSize: 11 }} domain={[0, 60]} />
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${val}% (${item.payload.highRisk} of ${item.payload.total} staff)`,
                    'Attrition Rate',
                  ]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="attritionRate" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={32}>
                  {salaryChartData.map((entry, index) => (
                    <Cell
                      key={`sal-${index}`}
                      fill={entry.attritionRate > 35 ? '#f43f5e' : entry.attritionRate > 25 ? '#f59e0b' : '#3b82f6'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 7. PRIORITY EMPLOYEES SECTION (Highest Risk Requiring Attention) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                <AlertTriangle className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Priority Retention Attention Required
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Employees with extreme flight risk scores (&gt;80%) & primary driver breakdown
            </p>
          </div>

          <button
            onClick={() => setActiveTab('employees')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 self-start sm:self-auto"
          >
            View All {highRiskCount} High-Risk Records <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Employee</th>
                <th className="py-3 px-3">Department & Role</th>
                <th className="py-3 px-3">Tenure / Salary</th>
                <th className="py-3 px-3">Primary Risk Factor</th>
                <th className="py-3 px-3 text-center">Attrition Risk</th>
                <th className="py-3 px-3 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {priorityEmployees.map((emp) => (
                <tr
                  key={emp.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  onClick={() => selectEmployee(emp)}
                >
                  <td className="py-3 px-3">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {emp.name}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400">{emp.id}</div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-800 dark:text-slate-200">{emp.role}</div>
                    <div className="text-[11px] text-slate-500">{emp.department}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-800 dark:text-slate-200">
                      ₹{emp.monthlySalary.toLocaleString('en-IN')}/mo
                    </div>
                    <div className="text-[11px] text-slate-500">{emp.yearsAtCompany} yrs at co • {emp.yearsSincePromotion} yrs promo gap</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40">
                      {emp.primaryRiskFactor}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                        {Math.round(emp.attritionRisk * 100)}%
                      </span>
                      <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-0.5">
                        <div
                          className="h-full bg-rose-500 rounded-full"
                          style={{ width: `${Math.round(emp.attritionRisk * 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        selectEmployee(emp);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 transition-colors"
                    >
                      Diagnose & Retain
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
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
