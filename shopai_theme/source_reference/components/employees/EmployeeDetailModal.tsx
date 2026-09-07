import React, { useMemo } from 'react';
import {
  X,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Sliders,
  DollarSign,
  Clock,
  Briefcase,
  Award,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  User,
  MapPin,
  Calendar,
  Building,
  Trash2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import {
  calculateSHAPContributions,
  generateRetentionRecommendations,
  DEPT_SALARY_BENCHMARKS,
} from '../../ml/engine';
import { Employee } from '../../types';

export const EmployeeDetailModal: React.FC = () => {
  const { selectedEmployee, selectEmployee, setActiveTab, addIntervention, showToast, deleteEmployee } = useApp();

  if (!selectedEmployee) return null;

  const emp = selectedEmployee;
  const riskPercent = Math.round(emp.attritionRisk * 100);
  const shapContributions = useMemo(() => calculateSHAPContributions(emp), [emp]);
  const recommendations = useMemo(() => generateRetentionRecommendations(emp), [emp]);

  const deptBenchmark = DEPT_SALARY_BENCHMARKS[emp.department]?.median || 120000;
  const salaryDiff = Math.round(((emp.monthlySalary - deptBenchmark) / deptBenchmark) * 100);

  // Salary comparison chart data
  const salaryComparisonData = [
    { name: 'Employee', salary: emp.monthlySalary, color: '#4f46e5' },
    { name: 'Dept 25th %ile', salary: Math.round(deptBenchmark * 0.85), color: '#94a3b8' },
    { name: 'Dept Median', salary: deptBenchmark, color: '#0ea5e9' },
    { name: 'Dept 75th %ile', salary: Math.round(deptBenchmark * 1.2), color: '#94a3b8' },
  ];

  // Historical satisfaction trend (mocked quarterly trajectory)
  const satisfactionTrendData = [
    { quarter: 'Q1 25', score: Math.min(5, emp.satisfactionScore + 1.5) },
    { quarter: 'Q2 25', score: Math.min(5, emp.satisfactionScore + 1.0) },
    { quarter: 'Q3 25', score: Math.min(5, emp.satisfactionScore + 0.5) },
    { quarter: 'Q4 25', score: Math.max(1, emp.satisfactionScore + 0.2) },
    { quarter: 'Q1 26 (Current)', score: emp.satisfactionScore },
  ];

  // Overtime trend (last 5 months)
  const overtimeTrendData = [
    { month: 'Nov', hours: Math.max(0, emp.overtimeHoursWeekly - 8) },
    { month: 'Dec', hours: Math.max(0, emp.overtimeHoursWeekly - 4) },
    { month: 'Jan', hours: Math.max(0, emp.overtimeHoursWeekly - 2) },
    { month: 'Feb', hours: emp.overtimeHoursWeekly },
    { month: 'Mar (Now)', hours: emp.overtimeHoursWeekly },
  ];

  const handleSimulate = () => {
    setActiveTab('simulator');
  };

  const handleApplyRecommendation = (rec: any) => {
    addIntervention({
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      actionTitle: rec.title,
      category: rec.category,
      assignedTo: 'People Operations Committee',
      status: 'Proposed',
      initialRisk: emp.attritionRisk,
      projectedRisk: Math.max(0.1, Math.round((emp.attritionRisk * (1 - rec.expectedImpactPercent / 100)) * 100) / 100),
      costINR: rec.estimatedCostINR,
      notes: rec.description,
    });
  };

  // Color theme based on risk
  const isHigh = emp.riskLevel === 'high';
  const isMed = emp.riskLevel === 'medium';
  const badgeColor = isHigh
    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 border-rose-300 dark:border-rose-900'
    : isMed
    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-amber-300 dark:border-amber-900'
    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-300 dark:border-emerald-900';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 my-8 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{emp.name}</h2>
              <span className="font-mono text-xs text-slate-400">({emp.id})</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase border ${badgeColor}`}>
                {emp.riskLevel} Risk ({riskPercent}%)
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {emp.role} • {emp.department} • {emp.yearsAtCompany} yrs tenure
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to permanently delete employee record for ${emp.name} (${emp.id})?`)) {
                  deleteEmployee(emp.id);
                  selectEmployee(null);
                }
              }}
              className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-300 dark:hover:bg-rose-900/60 transition-colors"
              title="Delete employee record"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Record
            </button>
            <button
              onClick={handleSimulate}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition-colors"
            >
              <Sliders className="h-3.5 w-3.5" />
              Test What-If Simulation
            </button>
            <button
              onClick={() => selectEmployee(null)}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Top Row: Risk Score Gauge + Quick Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* SVG Semi-Circle Risk Score Gauge */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-800/30 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Chance of Leaving
              </span>
              <div className="relative flex items-center justify-center">
                <svg className="h-36 w-36 -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    className="stroke-slate-200 dark:stroke-slate-700"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    className={
                      isHigh
                        ? 'stroke-rose-500'
                        : isMed
                        ? 'stroke-amber-500'
                        : 'stroke-emerald-500'
                    }
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 48}
                    strokeDashoffset={(2 * Math.PI * 48) * (1 - emp.attritionRisk)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {riskPercent}%
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {isHigh ? 'High Risk' : isMed ? 'Medium Risk' : 'Safe / Low'}
                  </span>
                </div>
              </div>
              <div className="mt-3 text-xs font-medium text-slate-600 dark:text-slate-300">
                Calculated by <strong className="text-indigo-600 dark:text-indigo-400">Smart AI Engine</strong>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Model confidence: 93% accuracy
              </p>
            </div>

            {/* Core Employment Profile Cards */}
            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Monthly Pay</div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  ₹{emp.monthlySalary.toLocaleString('en-IN')}
                </div>
                <span className={`text-[11px] font-semibold ${salaryDiff < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {salaryDiff < 0 ? `${salaryDiff}% vs Department Average` : `+${salaryDiff}% vs Department Average`}
                </span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Overtime Hours</div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {emp.overtimeHoursWeekly} hrs/week
                </div>
                <span className="text-[11px] text-slate-500">
                  {emp.overtimeHoursWeekly > 8 ? 'High extra hours' : emp.overtimeHoursWeekly > 0 ? 'Moderate extra hours' : 'Normal 40-hr week'}
                </span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Last Promoted</div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {emp.yearsSincePromotion === 0 ? 'This year' : `${emp.yearsSincePromotion} years ago`}
                </div>
                <span className={`text-[11px] font-semibold ${emp.yearsSincePromotion >= 3 ? 'text-rose-500' : 'text-slate-500'}`}>
                  {emp.yearsSincePromotion >= 3 ? 'Promotion overdue' : 'Regular promotion cadence'}
                </span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Job Happiness</div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {emp.satisfactionScore} / 5.0
                </div>
                <span className="text-[11px] text-amber-500 font-medium">
                  {'★'.repeat(emp.satisfactionScore)} rating
                </span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Work Style</div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {emp.remoteWorkOption}
                </div>
                <span className="text-[11px] text-slate-500">{emp.distanceFromHomeKm} km commute distance</span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Manager Relationship</div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {emp.managerRelationshipScore} / 5.0
                </div>
                <span className="text-[11px] text-slate-500">
                  {emp.managerRelationshipScore >= 4 ? 'Strong communication' : emp.managerRelationshipScore <= 2 ? 'Needs support / conflict' : 'Good collaboration'}
                </span>
              </div>
            </div>
          </div>

          {/* EXPLAINABLE AI SECTION: “Why is this employee at risk?” */}
          <div className="rounded-2xl border border-indigo-200/90 bg-indigo-50/40 p-5 dark:border-indigo-900/60 dark:bg-indigo-950/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Main Reasons: Why might this employee leave or stay?
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Red indicators show factors increasing the risk of leaving. Green indicators show reasons encouraging them to stay.
            </p>

            {/* Waterfall-style contribution bars */}
            <div className="space-y-3">
              {shapContributions.map((c) => {
                const isPushingAttrition = c.impact > 0;
                const impactPercent = Math.abs(Math.round(c.impact * 100));

                return (
                  <div key={c.factor} className="rounded-xl border border-slate-200/80 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            isPushingAttrition ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                        />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {c.factor}
                        </span>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          {c.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-bold">
                        <span className="font-mono text-slate-500 text-[11px]">{c.value}</span>
                        <span className={isPushingAttrition ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                          {isPushingAttrition ? `+${impactPercent}% Risk to Leave` : `-${impactPercent}% Risk (Helping Stay)`}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-300">
                      {c.description}
                    </div>

                    {/* Visual contribution bar */}
                    <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isPushingAttrition ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, impactPercent * 3.5)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Comparative Analytics Row: Salary Comparison & Trajectory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Salary vs Department Benchmarks */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                Pay Comparison Across {emp.department}
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                Comparing this employee's pay against department peers
              </p>

              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salaryComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
                    <Tooltip
                      formatter={(val: any) => [`₹${val.toLocaleString('en-IN')}`, 'Monthly Pay']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: 'none',
                        borderRadius: '0.5rem',
                        color: '#fff',
                        fontSize: '11px',
                      }}
                    />
                    <Bar dataKey="salary" radius={[4, 4, 0, 0]} barSize={28}>
                      {salaryComparisonData.map((entry, index) => (
                        <Cell key={`bar-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Satisfaction History Trend */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                Job Happiness Over Past Quarters
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                Tracking employee happiness rating over the last 5 quarters
              </p>

              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={satisfactionTrendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="quarter" tick={{ fontSize: 10 }} />
                    <YAxis domain={[1, 5]} tick={{ fontSize: 10 }} />
                    <Tooltip
                      formatter={(val: any) => [`${val} / 5`, 'Happiness Rating']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: 'none',
                        borderRadius: '0.5rem',
                        color: '#fff',
                        fontSize: '11px',
                      }}
                    />
                    <Line type="monotone" dataKey="score" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* AI RETENTION RECOMMENDATIONS SECTION */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Recommended Steps to Keep this Employee
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                {recommendations.length} recommended action plans
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 dark:bg-slate-800/40 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {rec.title}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          rec.priority === 'Urgent'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                        }`}
                      >
                        {rec.priority === 'Urgent' ? 'High Priority' : rec.priority}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                      {rec.description}
                    </p>

                    <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-center">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase">Impact</div>
                        <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          -{rec.expectedImpactPercent}% Leaving Risk
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase">Est. Cost</div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          ₹{rec.estimatedCostINR.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase">Value / ROI</div>
                        <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {rec.roiMultiplier}x
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleApplyRecommendation(rec)}
                    className="mt-3.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 transition-colors"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Apply this Recommendation
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-200 px-6 py-3.5 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            SHOP AI Retention Intelligence Engine • Version 3.4
          </span>
          <button
            onClick={() => selectEmployee(null)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
