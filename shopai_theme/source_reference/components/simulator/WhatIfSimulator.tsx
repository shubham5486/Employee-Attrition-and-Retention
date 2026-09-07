import React, { useState, useMemo } from 'react';
import {
  Sliders,
  TrendingDown,
  Sparkles,
  ArrowRight,
  DollarSign,
  Clock,
  Award,
  BookOpen,
  Users,
  Home,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
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
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { simulateWhatIfScenario } from '../../ml/engine';
import { WhatIfInput, Employee } from '../../types';

export const WhatIfSimulator: React.FC = () => {
  const { employees, selectedEmployee, selectEmployee, addIntervention, showToast } = useApp();

  // Selected employee for simulation (default to first high-risk employee if none selected)
  const defaultEmp = useMemo(() => {
    return selectedEmployee || employees.find((e) => e.riskLevel === 'high') || employees[0];
  }, [selectedEmployee, employees]);

  const [activeEmpId, setActiveEmpId] = useState<string>(defaultEmp?.id || '');

  const currentEmp = useMemo(() => {
    return employees.find((e) => e.id === activeEmpId) || defaultEmp;
  }, [employees, activeEmpId, defaultEmp]);

  // Simulator Inputs State
  const [inputs, setInputs] = useState<WhatIfInput>({
    salaryIncreasePercent: 15,
    reduceOvertimeHours: Math.min(12, currentEmp?.overtimeHoursWeekly || 8),
    isPromoted: currentEmp?.yearsSincePromotion >= 3,
    trainingEnrolled: true,
    improveManagerRelationship: currentEmp?.managerRelationshipScore <= 2,
    boostSatisfactionScore: 1.5,
    remoteOption: 'Hybrid',
  });

  // Calculate simulation result live
  const simulationResult = useMemo(() => {
    if (!currentEmp) return null;
    return simulateWhatIfScenario(currentEmp, inputs);
  }, [currentEmp, inputs]);

  const handleReset = () => {
    setInputs({
      salaryIncreasePercent: 0,
      reduceOvertimeHours: 0,
      isPromoted: false,
      trainingEnrolled: false,
      improveManagerRelationship: false,
      boostSatisfactionScore: 0,
      remoteOption: currentEmp?.remoteWorkOption || 'Hybrid',
    });
    showToast('Simulation parameters reset to baseline', 'info');
  };

  const handleApplyScenario = () => {
    if (!currentEmp || !simulationResult) return;
    addIntervention({
      employeeId: currentEmp.id,
      employeeName: currentEmp.name,
      department: currentEmp.department,
      actionTitle: `What-If Retain Plan (+${inputs.salaryIncreasePercent}% Pay, -${inputs.reduceOvertimeHours}h Overtime)`,
      category: 'Simulated Intervention',
      assignedTo: 'HR Operations Taskforce',
      status: 'Proposed',
      initialRisk: simulationResult.originalRisk,
      projectedRisk: simulationResult.simulatedRisk,
      costINR: simulationResult.interventionCostINR,
      notes: `Targeted retention package engineered via What-If Simulation. Net projected savings: ₹${simulationResult.netEstimatedSavingsINR.toLocaleString('en-IN')}`,
    });
  };

  if (!currentEmp || !simulationResult) return null;

  const comparisonChartData = [
    {
      metric: 'Attrition Risk',
      Before: Math.round(simulationResult.originalRisk * 100),
      After: Math.round(simulationResult.simulatedRisk * 100),
    },
    {
      metric: 'Retention Prob',
      Before: Math.round((1 - simulationResult.originalRisk) * 100),
      After: Math.round(simulationResult.retentionProbability * 100),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <Sliders className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              What-If Retention Decision Simulator
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Test compensation, workload caps, and promotions to evaluate risk drops & financial ROI before investing budget
          </p>
        </div>

        {/* Employee Selector dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 shrink-0">Simulating For:</span>
          <select
            value={activeEmpId}
            onChange={(e) => setActiveEmpId(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 shadow-2xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 max-w-xs truncate"
          >
            {employees
              .filter((e) => e.riskLevel === 'high' || e.id === currentEmp.id)
              .slice(0, 50)
              .map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.id}) • {Math.round(e.attritionRisk * 100)}% Risk • {e.department}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Main Simulation Layout: Left Controls + Right Live Impact Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Interactive Scenario Parameters (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Adjust Policy Levers
                </h3>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            </div>

            {/* Lever 1: Salary Increase */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                  Salary Revision (% Increase)
                </span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  +{inputs.salaryIncreasePercent}% (+₹{Math.round(currentEmp.monthlySalary * (inputs.salaryIncreasePercent / 100)).toLocaleString('en-IN')}/mo)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="5"
                value={inputs.salaryIncreasePercent}
                onChange={(e) =>
                  setInputs({ ...inputs, salaryIncreasePercent: Number(e.target.value) })
                }
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0%</span>
                <span>+10%</span>
                <span>+20%</span>
                <span>+30%</span>
                <span>+40%</span>
              </div>
            </div>

            {/* Lever 2: Overtime Reduction */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-rose-500" />
                  Reduce Weekly Overtime
                </span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  -{inputs.reduceOvertimeHours} hrs (New: {Math.max(0, currentEmp.overtimeHoursWeekly - inputs.reduceOvertimeHours)} hrs/wk)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.max(10, currentEmp.overtimeHoursWeekly)}
                step="2"
                value={inputs.reduceOvertimeHours}
                onChange={(e) =>
                  setInputs({ ...inputs, reduceOvertimeHours: Number(e.target.value) })
                }
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0 hrs</span>
                <span>Cut 5 hrs</span>
                <span>Cut 10 hrs</span>
                <span>Eliminate All</span>
              </div>
            </div>

            {/* Lever 3: Promotion Status Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-500" />
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Fast-Track Promotion
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Elevate title & reset stagnation index
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={inputs.isPromoted}
                  onChange={(e) => setInputs({ ...inputs, isPromoted: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* Lever 4: Training & Mentorship */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-500" />
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Sponsored Certification & Upskilling
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Enroll in advanced technical/leadership track
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={inputs.trainingEnrolled}
                  onChange={(e) => setInputs({ ...inputs, trainingEnrolled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* Lever 5: Manager Alignment / Reassignment */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Resolve Managerial Dynamics
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Reassign reporting line or skip-level coaching
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={inputs.improveManagerRelationship}
                  onChange={(e) =>
                    setInputs({ ...inputs, improveManagerRelationship: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* Lever 6: Remote Work Option */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Home className="h-3.5 w-3.5 text-indigo-500" />
                Remote Work Arrangement
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['On-site', 'Hybrid', 'Full-time'] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setInputs({ ...inputs, remoteOption: opt })}
                    className={`py-2 px-2.5 rounded-xl text-xs font-medium border transition-colors ${
                      inputs.remoteOption === opt
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-bold dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800'
                        : 'border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Live Recalculation Results (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Before vs After Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Simulation Outcome & Attrition Recalculation
                </h3>
                <p className="text-xs text-slate-500">
                  Target: <strong>{currentEmp.name}</strong> ({currentEmp.role}, {currentEmp.department})
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400">Expected ROI</span>
                <div className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                  {simulationResult.roiPercent}%
                </div>
              </div>
            </div>

            {/* Before vs After Visualizer */}
            <div className="grid grid-cols-2 gap-4">
              {/* BEFORE */}
              <div className="rounded-2xl border border-rose-200/90 bg-rose-50/50 p-4 dark:border-rose-900/60 dark:bg-rose-950/20 text-center">
                <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                  Current Baseline Risk
                </div>
                <div className="text-4xl sm:text-5xl font-extrabold text-rose-600 dark:text-rose-400 my-2">
                  {Math.round(simulationResult.originalRisk * 100)}%
                </div>
                <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-900 dark:text-rose-300">
                  {simulationResult.originalRiskLevel.toUpperCase()} RISK
                </span>
                <p className="text-[11px] text-slate-500 mt-2">
                  Exposure: ₹{(simulationResult.annualReplacementCostINR / 100000).toFixed(1)} Lakhs
                </p>
              </div>

              {/* AFTER INTERVENTION */}
              <div className="rounded-2xl border border-emerald-200/90 bg-emerald-50/50 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/20 text-center">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Simulated Post-Action Risk
                </div>
                <div className="text-4xl sm:text-5xl font-extrabold text-emerald-600 dark:text-emerald-400 my-2">
                  {Math.round(simulationResult.simulatedRisk * 100)}%
                </div>
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                  {simulationResult.simulatedRiskLevel.toUpperCase()} RISK
                </span>
                <p className="text-[11px] text-emerald-600 font-semibold mt-2">
                  ↓ {Math.round(simulationResult.riskDifference * 100)}% Risk Reduction
                </p>
              </div>
            </div>

            {/* Financial Impact of Scenario */}
            <div className="rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-950 p-5 text-white shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Estimated Financial Savings
                </span>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                  Cost Avoidance Model
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <div className="text-3xl sm:text-4xl font-extrabold text-white">
                  ₹{simulationResult.netEstimatedSavingsINR.toLocaleString('en-IN')}
                </div>
                <span className="text-xs text-indigo-200">net annual savings</span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Turnover Cost Avoided</div>
                  <div className="font-bold text-slate-200">
                    ₹{Math.round(simulationResult.annualReplacementCostINR * Math.max(0, simulationResult.riskDifference)).toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Intervention Cost</div>
                  <div className="font-bold text-rose-300">
                    -₹{simulationResult.interventionCostINR.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Retention Probability</div>
                  <div className="font-bold text-emerald-400">
                    {Math.round(simulationResult.retentionProbability * 100)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Before vs After Bar Chart */}
            <div className="h-44 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
                  <YAxis unit="%" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, '']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: 'none',
                      borderRadius: '0.5rem',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="Before" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={24} />
                  <Bar dataKey="After" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={handleApplyScenario}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-indigo-500 transition-all hover:scale-[1.01]"
              >
                <CheckCircle2 className="h-4 w-4" />
                Commit & Log as Formal Retention Intervention
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
