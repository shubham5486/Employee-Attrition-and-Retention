import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Sliders,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  UserPlus,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Employee, RiskLevel } from '../../types';
import { AddEmployeeModal } from './AddEmployeeModal';

export const EmployeeRiskAnalysis: React.FC = () => {
  const {
    employees,
    selectEmployee,
    setActiveTab,
    activeRole,
    showToast,
    addEmployee,
    deleteEmployee,
    deleteMultipleEmployees,
  } = useApp();

  // Filters & state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedRisk, setSelectedRisk] = useState<string>('All');
  const [selectedOvertime, setSelectedOvertime] = useState<string>('All');
  const [sortField, setSortField] = useState<keyof Employee>('attritionRisk');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Add & Delete state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  const departments = ['All', 'Engineering', 'Product', 'Sales', 'Marketing', 'Human Resources', 'Operations'];
  const riskLevels = ['All', 'High Risk', 'Medium Risk', 'Low Risk'];

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // Search term match
      const matchesSearch =
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase());

      // Department filter
      const matchesDept = selectedDept === 'All' || emp.department === selectedDept;

      // Risk level filter
      let matchesRisk = true;
      if (selectedRisk === 'High Risk') matchesRisk = emp.riskLevel === 'high';
      else if (selectedRisk === 'Medium Risk') matchesRisk = emp.riskLevel === 'medium';
      else if (selectedRisk === 'Low Risk') matchesRisk = emp.riskLevel === 'low';

      // Overtime filter
      let matchesOvertime = true;
      if (selectedOvertime === 'Yes') matchesOvertime = emp.hasOvertime || emp.overtimeHoursWeekly > 0;
      else if (selectedOvertime === 'No') matchesOvertime = !emp.hasOvertime && emp.overtimeHoursWeekly === 0;

      return matchesSearch && matchesDept && matchesRisk && matchesOvertime;
    });
  }, [employees, searchTerm, selectedDept, selectedRisk, selectedOvertime]);

  // Sort
  const sortedEmployees = useMemo(() => {
    return [...filteredEmployees].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') {
        return sortOrder === 'asc'
          ? (aVal as string).localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal as string);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
  }, [filteredEmployees, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedEmployees.length / itemsPerPage) || 1;
  const paginatedEmployees = sortedEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: keyof Employee) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const exportFilteredCSV = () => {
    const headers = [
      'Employee ID',
      'Name',
      'Department',
      'Role',
      'Experience (Yrs)',
      'Monthly Salary (INR)',
      'Satisfaction (1-5)',
      'Overtime (Hrs/Wk)',
      'Years Since Promotion',
      'Attrition Risk (%)',
      'Risk Level',
      'Primary Risk Factor',
    ];

    const rows = sortedEmployees.map((e) => [
      e.id,
      `"${e.name}"`,
      `"${e.department}"`,
      `"${e.role}"`,
      e.yearsAtCompany,
      e.monthlySalary,
      e.satisfactionScore,
      e.overtimeHoursWeekly,
      e.yearsSincePromotion,
      Math.round(e.attritionRisk * 100),
      e.riskLevel.toUpperCase(),
      `"${e.primaryRiskFactor}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `shopai_risk_analysis_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${sortedEmployees.length} employee risk records to CSV`, 'success');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Employee List & Risk of Leaving
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            View employee details, job happiness, overtime hours, and who is most likely to stay or leave
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {selectedIds.length > 0 && (
            <button
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 shadow-2xs hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-300 dark:hover:bg-rose-900/60 transition-colors"
            >
              <Trash2 className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              Delete Selected ({selectedIds.length})
            </button>
          )}

          <button
            onClick={exportFilteredCSV}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <Download className="h-4 w-4 text-slate-500" />
            Download Spreadsheet (CSV)
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition-all hover:scale-[1.01]"
          >
            <UserPlus className="h-4 w-4" />
            + Add Employee
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by employee name, ID, or job role..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-100"
            />
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 shrink-0">Department:</span>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-xs text-slate-900 font-medium focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-100"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d === 'All' ? 'All Departments' : d}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Level Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 shrink-0">Leaving Risk:</span>
            <select
              value={selectedRisk}
              onChange={(e) => {
                setSelectedRisk(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-xs text-slate-900 font-medium focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-100"
            >
              <option value="All">All Risk Levels</option>
              <option value="high">High Risk (Likely to leave)</option>
              <option value="medium">Medium Risk (Watch closely)</option>
              <option value="low">Safe / Low Risk</option>
            </select>
          </div>

          {/* Overtime Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 shrink-0">Overtime:</span>
            <select
              value={selectedOvertime}
              onChange={(e) => {
                setSelectedOvertime(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-xs text-slate-900 font-medium focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-100"
            >
              <option value="All">All Employees</option>
              <option value="Yes">Works Extra Overtime</option>
              <option value="No">No Overtime (Normal Hours)</option>
            </select>
          </div>
        </div>

        {/* Quick summary strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing <strong>{filteredEmployees.length}</strong> of {employees.length} employees
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              Red = High Risk of Leaving (&gt;65%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Amber = Medium Risk (35-65%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Green = Safe / Likely to Stay (&lt;35%)
            </span>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/40 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 pl-4 pr-1 w-8">
                  <input
                    type="checkbox"
                    checked={paginatedEmployees.length > 0 && paginatedEmployees.every((e) => selectedIds.includes(e.id))}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const newIds = Array.from(new Set([...selectedIds, ...paginatedEmployees.map((emp) => emp.id)]));
                        setSelectedIds(newIds);
                      } else {
                        setSelectedIds(selectedIds.filter((id) => !paginatedEmployees.some((emp) => emp.id === id)));
                      }
                    }}
                    className="h-3.5 w-3.5 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
                    aria-label="Select all on this page"
                  />
                </th>
                <th className="py-3 px-3 cursor-pointer select-none" onClick={() => handleSort('id')}>
                  <div className="flex items-center gap-1">
                    ID <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer select-none" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">
                    Employee Name <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Department & Role</th>
                <th className="py-3 px-3 cursor-pointer select-none" onClick={() => handleSort('yearsAtCompany')}>
                  <div className="flex items-center gap-1">
                    Years at Company <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer select-none" onClick={() => handleSort('monthlySalary')}>
                  <div className="flex items-center gap-1">
                    Monthly Pay (₹) <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer select-none" onClick={() => handleSort('satisfactionScore')}>
                  <div className="flex items-center gap-1">
                    Job Happiness <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Extra Overtime</th>
                <th className="py-3 px-3">Last Promoted</th>
                <th className="py-3 px-3 cursor-pointer select-none text-center" onClick={() => handleSort('attritionRisk')}>
                  <div className="flex items-center justify-center gap-1">
                    Chance of Leaving <ArrowUpDown className="h-3 w-3 text-indigo-600" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center">Risk Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {paginatedEmployees.map((emp) => {
                // Color badges
                const isHigh = emp.riskLevel === 'high';
                const isMed = emp.riskLevel === 'medium';

                return (
                  <tr
                    key={emp.id}
                    onClick={() => selectEmployee(emp)}
                    className="hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    {/* Select Checkbox */}
                    <td className="py-3 pl-4 pr-1 w-8" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(emp.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds((prev) => [...prev, emp.id]);
                          } else {
                            setSelectedIds((prev) => prev.filter((id) => id !== emp.id));
                          }
                        }}
                        className="h-3.5 w-3.5 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
                        aria-label={`Select ${emp.name}`}
                      />
                    </td>

                    {/* Employee ID */}
                    <td className="py-3 px-3 font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {emp.id}
                    </td>

                    {/* Name (No Logo/Avatar) */}
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {emp.name}
                      </span>
                    </td>

                    {/* Department & Role */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{emp.role}</div>
                      <div className="text-[11px] text-slate-400">{emp.department}</div>
                    </td>

                    {/* Experience */}
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                      {emp.yearsAtCompany} years
                    </td>

                    {/* Salary */}
                    <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">
                      {activeRole === 'Analyst' ? '•••••• (Masked)' : `₹${emp.monthlySalary.toLocaleString('en-IN')}`}
                    </td>

                    {/* Satisfaction Score */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <div className="flex text-amber-400">
                          {'★'.repeat(emp.satisfactionScore)}
                          <span className="text-slate-200 dark:text-slate-700">{'★'.repeat(5 - emp.satisfactionScore)}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">({emp.satisfactionScore}/5)</span>
                      </div>
                    </td>

                    {/* Overtime */}
                    <td className="py-3 px-3">
                      {emp.hasOvertime || emp.overtimeHoursWeekly > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                          <Clock className="h-3 w-3" />
                          {emp.overtimeHoursWeekly} hrs/wk
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">None (0 hrs)</span>
                      )}
                    </td>

                    {/* Promotion History */}
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      {emp.yearsSincePromotion === 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">This year</span>
                      ) : (
                        `${emp.yearsSincePromotion} yrs ago`
                      )}
                    </td>

                    {/* Chance of Leaving % */}
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span
                          className={`font-extrabold text-sm ${
                            isHigh ? 'text-rose-600 dark:text-rose-400' : isMed ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {Math.round(emp.attritionRisk * 100)}%
                        </span>
                        <div className="w-14 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-0.5">
                          <div
                            className={`h-full rounded-full ${
                              isHigh ? 'bg-rose-500' : isMed ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.round(emp.attritionRisk * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Risk Level Badge (Red / Amber / Green) */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                          isHigh
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50'
                            : isMed
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isHigh ? 'bg-rose-600' : isMed ? 'bg-amber-600' : 'bg-emerald-600'
                          }`}
                        />
                        {isHigh ? 'High Risk' : isMed ? 'Medium Risk' : 'Safe / Low'}
                      </span>
                    </td>

                    {/* Actions: Details & Delete */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            selectEmployee(emp);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 transition-colors"
                        >
                          <Eye className="h-3 w-3" />
                          View Details
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEmployeeToDelete(emp);
                          }}
                          className="inline-flex items-center justify-center h-7 w-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 transition-colors"
                          title={`Delete employee ${emp.name}`}
                          aria-label={`Delete employee ${emp.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="text-xs text-slate-500">
            Page <strong className="text-slate-900 dark:text-white">{currentPage}</strong> of{' '}
            <strong className="text-slate-900 dark:text-white">{totalPages}</strong> ({sortedEmployees.length} items)
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddEmployee={(newEmp) => addEmployee(newEmp)}
      />

      {/* Single Delete Confirmation Dialog */}
      {employeeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Employee Record</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Permanent action confirmation</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to delete <strong>{employeeToDelete.name}</strong> (
              <span className="font-mono">{employeeToDelete.id}</span>) from the{' '}
              <strong>{employeeToDelete.department}</strong> department? This record will be permanently removed from all attrition analysis and machine learning calculations.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setEmployeeToDelete(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteEmployee(employeeToDelete.id);
                  setSelectedIds((prev) => prev.filter((id) => id !== employeeToDelete.id));
                  setEmployeeToDelete(null);
                }}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-500 transition-colors"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Dialog */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Selected Employees</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Bulk action confirmation</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to delete <strong>{selectedIds.length}</strong> selected employee records? This action cannot be reversed and will update workforce attrition analytics immediately.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteMultipleEmployees(selectedIds);
                  setSelectedIds([]);
                  setIsBulkDeleteModalOpen(false);
                }}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-500 transition-colors"
              >
                Delete {selectedIds.length} Records
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
