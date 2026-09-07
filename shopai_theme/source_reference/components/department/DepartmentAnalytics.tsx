import React, { useState, useMemo } from 'react';
import {
  Building2,
  Users,
  AlertTriangle,
  Clock,
  Award,
  Sparkles,
  DollarSign,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
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
import { DEPT_SALARY_BENCHMARKS } from '../../ml/engine';

export const DepartmentAnalytics: React.FC = () => {
  const { employees, selectEmployee, setActiveTab, addIntervention, showToast } = useApp();

  const departments = ['Engineering', 'Product', 'Sales', 'Marketing', 'Human Resources', 'Operations'];
  const [selectedDept, setSelectedDept] = useState<string>('Engineering');

  // Department filtered employees
  const deptEmployees = useMemo(() => {
    return employees.filter((e) => e.department === selectedDept);
  }, [employees, selectedDept]);

  const totalDeptCount = deptEmployees.length;
  const highRiskEmployees = useMemo(() => deptEmployees.filter((e) => e.riskLevel === 'high'), [deptEmployees]);
  const mediumRiskEmployees = useMemo(() => deptEmployees.filter((e) => e.riskLevel === 'medium'), [deptEmployees]);
  const lowRiskEmployees = useMemo(() => deptEmployees.filter((e) => e.riskLevel === 'low'), [deptEmployees]);

  const deptAttritionRate = totalDeptCount > 0
    ? Math.round((highRiskEmployees.length / totalDeptCount) * 1000) / 10
    : 0;

  const avgTenure = totalDeptCount > 0
    ? Math.round((deptEmployees.reduce((acc, e) => acc + e.yearsAtCompany, 0) / totalDeptCount) * 10) / 10
    : 0;

  const avgSalary = totalDeptCount > 0
    ? Math.round(deptEmployees.reduce((acc, e) => acc + e.monthlySalary, 0) / totalDeptCount)
    : 0;

  const avgOvertime = totalDeptCount > 0
    ? Math.round((deptEmployees.reduce((acc, e) => acc + e.overtimeHoursWeekly, 0) / totalDeptCount) * 10) / 10
    : 0;

  const avgSatisfaction = totalDeptCount > 0
    ? Math.round((deptEmployees.reduce((acc, e) => acc + e.satisfactionScore, 0) / totalDeptCount) * 10) / 10
    : 0;

  // Salary distribution in department
  const salaryDistData = useMemo(() => {
    const benchmark = DEPT_SALARY_BENCHMARKS[selectedDept]?.median || 120000;
    const bands = [
      { band: '< -20%', count: deptEmployees.filter((e) => e.monthlySalary < benchmark * 0.8).length },
      { band: '-20% to -5%', count: deptEmployees.filter((e) => e.monthlySalary >= benchmark * 0.8 && e.monthlySalary < benchmark * 0.95).length },
      { band: 'Median Band (±5%)', count: deptEmployees.filter((e) => e.monthlySalary >= benchmark * 0.95 && e.monthlySalary <= benchmark * 1.05).length },
      { band: '+5% to +20%', count: deptEmployees.filter((e) => e.monthlySalary > benchmark * 1.05 && e.monthlySalary <= benchmark * 1.2).length },
      { band: '> +20%', count: deptEmployees.filter((e) => e.monthlySalary > benchmark * 1.2).length },
    ];
    return bands;
  }, [deptEmployees, selectedDept]);

  // Satisfaction distribution (1 to 5)
  const satisfactionDistData = useMemo(() => {
    return [1, 2, 3, 4, 5].map((score) => ({
      rating: `${score} Star`,
      count: deptEmployees.filter((e) => e.satisfactionScore === score).length,
    }));
  }, [deptEmployees]);

  // Predicted future attrition curve (4 quarters out)
  const futureAttritionCurve = [
    { quarter: 'Q1 (Current)', rate: deptAttritionRate },
    { quarter: 'Q2 26', rate: Math.round((deptAttritionRate + 1.8) * 10) / 10 },
    { quarter: 'Q3 26', rate: Math.round((deptAttritionRate + 3.4) * 10) / 10 },
    { quarter: 'Q4 26', rate: Math.round((deptAttritionRate + 4.9) * 10) / 10 },
    { quarter: 'Q1 27', rate: Math.round((deptAttritionRate + 5.8) * 10) / 10 },
  ];

  // Department-level strategic interventions
  const deptInterventions: Record<string, { title: string; desc: string; impact: string; cost: string }[]> = {
    Engineering: [
      {
        title: 'Overtime Redline Policy & Offshore Shift Rebalancing',
        desc: 'Establish a hard cap of 8 overtime hours weekly and reassign critical bug backlogs to global contract pool.',
        impact: 'Estimated -22% department attrition reduction',
        cost: '₹14 Lakhs',
      },
      {
        title: 'Market Compensation Realignment for Senior Engineers',
        desc: 'Correct compensation for the lowest 25th percentile to match standard technology salary benchmark medians.',
        impact: 'Estimated -26% retention lift in core talent',
        cost: '₹38 Lakhs',
      },
    ],
    Product: [
      {
        title: 'Product Leadership Mentorship & Design Career Track',
        desc: 'Introduce Principal PM dual-track progression (individual contributor vs managerial track).',
        impact: 'Estimated -18% attrition reduction',
        cost: '₹8 Lakhs',
      },
      {
        title: 'Cross-Functional Roadmapping Autonomy Workshop',
        desc: 'Empower PM squads with 20% sprint discovery bandwidth to elevate role ownership and satisfaction.',
        impact: 'Estimated -15% flight risk mitigation',
        cost: '₹4 Lakhs',
      },
    ],
    Sales: [
      {
        title: 'Quota Realignment & Uncapped Accelerator Incentives',
        desc: 'Adjust unattainable Q3 territory quotas and introduce quarterly retention accelerators.',
        impact: 'Estimated -24% quota-burnout reduction',
        cost: '₹22 Lakhs',
      },
    ],
    Marketing: [
      {
        title: 'Campaign Overtime Relief & Creator Agency Support',
        desc: 'Outsource surge asset production to avoid midnight crunch cycles during multi-product launches.',
        impact: 'Estimated -20% exhaustion reduction',
        cost: '₹9 Lakhs',
      },
    ],
    'Human Resources': [
      {
        title: 'People Partner Workload Balancing & Tooling Automation',
        desc: 'Deploy automated HR service desk tooling to reduce administrative caseload by 35%.',
        impact: 'Estimated -25% HRBP retention stability',
        cost: '₹6 Lakhs',
      },
    ],
    Operations: [
      {
        title: 'Shift Rotation Optimization & Commute Stipends',
        desc: 'Incorporate flexible hybrid transit subsidies and morning/evening rotation preferences.',
        impact: 'Estimated -19% turnover avoidance',
        cost: '₹7 Lakhs',
      },
    ],
  };

  const currentInterventions = deptInterventions[selectedDept] || deptInterventions.Engineering;

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Department Selector Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <Building2 className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Department Analytics & Cohort Diagnostics
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Micro-level workforce health telemetry, compensation distributions, and cohort-level policy interventions
          </p>
        </div>

        {/* Department Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          {departments.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDept(d)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                selectedDept === d
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards for Selected Department */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[10px] font-semibold text-slate-400 uppercase">Headcount</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {totalDeptCount}
          </div>
          <span className="text-[10px] text-slate-500">Active personnel</span>
        </div>

        <div className="rounded-2xl border border-rose-200/80 bg-rose-50/40 p-3.5 shadow-2xs dark:border-rose-900/60 dark:bg-rose-950/20">
          <div className="text-[10px] font-semibold text-rose-700 dark:text-rose-400 uppercase">High Risk</div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            {highRiskEmployees.length}
          </div>
          <span className="text-[10px] text-rose-600/90 font-medium">({deptAttritionRate}% rate)</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[10px] font-semibold text-slate-400 uppercase">Avg Salary</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            ₹{(avgSalary / 1000).toFixed(0)}k
          </div>
          <span className="text-[10px] text-slate-500">Monthly base</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[10px] font-semibold text-slate-400 uppercase">Avg Tenure</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {avgTenure} yrs
          </div>
          <span className="text-[10px] text-slate-500">Retention span</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[10px] font-semibold text-slate-400 uppercase">Avg Overtime</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {avgOvertime} h/wk
          </div>
          <span className="text-[10px] text-slate-500">Weekly burden</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[10px] font-semibold text-slate-400 uppercase">Satisfaction</div>
          <div className="text-xl font-bold text-amber-500 mt-1">
            {avgSatisfaction} / 5
          </div>
          <span className="text-[10px] text-slate-500">Role sentiment</span>
        </div>
      </div>

      {/* Row 1 Charts: Salary Distribution & Satisfaction Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Salary Distribution vs Department Benchmark */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Compensation Spread Relative to Market Median
              </h3>
              <p className="text-xs text-slate-500">
                Median benchmark for {selectedDept}: ₹{((DEPT_SALARY_BENCHMARKS[selectedDept]?.median || 120000) / 1000).toFixed(0)}k/mo
              </p>
            </div>
          </div>

          <div className="h-60 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salaryDistData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="band" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`${val} staff`, 'Headcount']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={28}>
                  {salaryDistData.map((entry, index) => (
                    <Cell
                      key={`sal-dist-${index}`}
                      fill={entry.band.includes('<') ? '#f43f5e' : entry.band.includes('>') ? '#10b981' : '#6366f1'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Satisfaction Distribution */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Employee Satisfaction Distribution
              </h3>
              <p className="text-xs text-slate-500">
                Frequency count of 1-star (severe disengagement) to 5-star (high engagement)
              </p>
            </div>
          </div>

          <div className="h-60 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={satisfactionDistData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="rating" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`${val} employees`, 'Count']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={28}>
                  {satisfactionDistData.map((entry, index) => (
                    <Cell
                      key={`sat-dist-${index}`}
                      fill={index < 2 ? '#f43f5e' : index === 2 ? '#f59e0b' : '#10b981'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Future Attrition Curve & Department Strategic Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Predicted Future Attrition Curve */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Predicted Attrition Trajectory (Next 4 Quarters)
              </h3>
              <p className="text-xs text-slate-500">
                Machine learning forecast under current unmitigated workplace policies
              </p>
            </div>
            <span className="text-xs font-bold text-rose-500">
              +{Math.round((futureAttritionCurve[4].rate - futureAttritionCurve[0].rate) * 10) / 10}% Trend
            </span>
          </div>

          <div className="h-60 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={futureAttritionCurve} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="quarter" tick={{ fontSize: 11 }} />
                <YAxis unit="%" tick={{ fontSize: 11 }} domain={[0, 45]} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Predicted Risk']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Line type="monotone" dataKey="rate" stroke="#f43f5e" strokeWidth={3} dot={{ r: 5, fill: '#f43f5e' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recommended Department Strategic Actions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Strategic {selectedDept} Interventions
                </h3>
              </div>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                Cohort Level
              </span>
            </div>

            <div className="space-y-3 mt-4">
              {currentInterventions.map((action, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 p-3.5 dark:border-slate-800 dark:bg-slate-800/40"
                >
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {action.title}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {action.desc}
                  </p>
                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {action.impact}
                    </span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Budget: {action.cost}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('simulator')}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition-colors"
          >
            Simulate Department Policy Change in What-If
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* High-Risk Employees in This Department Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Highest Risk Personnel in {selectedDept} ({highRiskEmployees.length} records)
            </h3>
            <p className="text-xs text-slate-500">
              Individuals driving the majority of departmental turnover exposure
            </p>
          </div>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Employee</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Monthly Pay</th>
                <th className="py-2.5 px-3">Overtime</th>
                <th className="py-2.5 px-3">Primary Risk Trigger</th>
                <th className="py-2.5 px-3 text-center">Risk Score</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {highRiskEmployees.slice(0, 8).map((emp) => (
                <tr
                  key={emp.id}
                  onClick={() => selectEmployee(emp)}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer"
                >
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-slate-900 dark:text-white">{emp.name}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{emp.role}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                    ₹{emp.monthlySalary.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-3 text-rose-600 dark:text-rose-400 font-medium">
                    {emp.overtimeHoursWeekly} hrs/wk
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                      {emp.primaryRiskFactor}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-rose-600 dark:text-rose-400">
                    {Math.round(emp.attritionRisk * 100)}%
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        selectEmployee(emp);
                      }}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                    >
                      View Profile
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
