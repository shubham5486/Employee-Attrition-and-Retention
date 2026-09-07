import React, { useState, useMemo } from 'react';
import {
  Lightbulb,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Filter,
  Search,
  ChevronRight,
  TrendingDown,
  AlertTriangle,
  Sliders,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateRetentionRecommendations } from '../../ml/engine';
import { Employee, RetentionRecommendation } from '../../types';

export const RetentionRecommendationsView: React.FC = () => {
  const { employees, selectEmployee, setActiveTab, addIntervention, showToast } = useApp();

  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Collect all recommendations for high and medium risk employees
  const allRecommendations = useMemo(() => {
    const list: { employee: Employee; rec: RetentionRecommendation }[] = [];
    employees
      .filter((e) => e.riskLevel === 'high' || e.riskLevel === 'medium')
      .forEach((emp) => {
        const recs = generateRetentionRecommendations(emp);
        recs.forEach((rec) => {
          list.push({ employee: emp, rec });
        });
      });
    return list;
  }, [employees]);

  // Filter recommendations
  const filtered = useMemo(() => {
    return allRecommendations.filter(({ employee, rec }) => {
      const matchDept = selectedDept === 'All' || employee.department === selectedDept;
      const matchCat = selectedCategory === 'All' || rec.category === selectedCategory;
      const matchSearch =
        employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDept && matchCat && matchSearch;
    });
  }, [allRecommendations, selectedDept, selectedCategory, searchQuery]);

  const departments = ['All', 'Engineering', 'Product', 'Sales', 'Marketing', 'Human Resources', 'Operations'];
  const categories = ['All', 'Compensation', 'Workload', 'Career Path', 'Wellbeing', 'Managerial'];

  const handleApply = (emp: Employee, rec: RetentionRecommendation) => {
    addIntervention({
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      actionTitle: rec.title,
      category: rec.category,
      assignedTo: 'HR Retention Committee',
      status: 'Proposed',
      initialRisk: emp.attritionRisk,
      projectedRisk: Math.max(0.12, Math.round(emp.attritionRisk * (1 - rec.expectedImpactPercent / 100) * 100) / 100),
      costINR: rec.estimatedCostINR,
      notes: rec.description,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
              <Lightbulb className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Employee Retention Recommendations
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Action plans and solutions to help you retain employees who might be thinking of leaving
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            {allRecommendations.length} Recommendations Available
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee or action..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 shrink-0">Dept:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-xs font-medium focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-100"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 shrink-0">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-xs font-medium focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-100"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.slice(0, 30).map(({ employee, rec }, idx) => (
          <div
            key={`${rec.id}-${idx}`}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition-all hover:shadow-md"
          >
            <div>
              {/* Employee brief */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div
                  className="cursor-pointer"
                  onClick={() => selectEmployee(employee)}
                >
                  <div className="text-xs font-bold text-slate-900 dark:text-white hover:text-indigo-600 transition-colors">
                    {employee.name}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {employee.role} • {employee.department}
                  </div>
                </div>

                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    employee.riskLevel === 'high'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                  }`}
                >
                  {Math.round(employee.attritionRisk * 100)}% Risk
                </span>
              </div>

              {/* Recommendation Content */}
              <div className="mt-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {rec.title}
                  </span>
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold shrink-0 ${
                      rec.priority === 'Urgent'
                        ? 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-900'
                        : 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-900'
                    }`}
                  >
                    {rec.priority}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  {rec.description}
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Impact</div>
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    -{rec.expectedImpactPercent}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Cost</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    ₹{(rec.estimatedCostINR / 1000).toFixed(0)}k
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">ROI</div>
                  <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {rec.roiMultiplier}x
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <button
                onClick={() => handleApply(employee, rec)}
                className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-500 transition-colors"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Authorize Plan
              </button>
              <button
                onClick={() => {
                  selectEmployee(employee);
                  setActiveTab('simulator');
                }}
                className="rounded-xl border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                title="Test in What-If Simulator"
              >
                <Sliders className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
