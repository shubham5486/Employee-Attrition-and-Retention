import React, { useState, useMemo } from 'react';
import { X, UserPlus, Sparkles, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Employee, RiskLevel } from '../../types';
import { predictAttritionProbability } from '../../ml/engine';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEmployee: (emp: Employee) => void;
}

const DEPARTMENTS = [
  'Engineering',
  'Sales',
  'Human Resources',
  'Research & Development',
  'Marketing',
  'Customer Support',
  'Operations',
];

const ROLES_BY_DEPT: Record<string, string[]> = {
  Engineering: [
    'Software Engineer',
    'Senior Software Engineer',
    'Tech Lead',
    'DevOps Engineer',
    'QA Automation Engineer',
    'Engineering Manager',
  ],
  Sales: [
    'Sales Account Executive',
    'Senior Account Executive',
    'Business Development Rep',
    'Sales Manager',
    'Enterprise Account Manager',
  ],
  'Human Resources': [
    'HR Generalist',
    'Talent Acquisition Specialist',
    'HR Business Partner',
    'People Operations Lead',
  ],
  'Research & Development': [
    'Data Scientist',
    'Senior ML Researcher',
    'Product Designer',
    'Research Scientist',
  ],
  Marketing: [
    'Growth Marketer',
    'Product Marketing Manager',
    'Content Strategist',
    'SEO Specialist',
  ],
  'Customer Support': [
    'Customer Success Specialist',
    'Technical Support Engineer',
    'Support Operations Manager',
  ],
  Operations: [
    'Operations Analyst',
    'Logistics Coordinator',
    'Supply Chain Specialist',
    'Operations Director',
  ],
};

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  onAddEmployee,
}) => {
  // Form State
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [role, setRole] = useState('Software Engineer');
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [education, setEducation] = useState("Bachelor's Degree");
  const [monthlySalary, setMonthlySalary] = useState(85000);
  const [yearsAtCompany, setYearsAtCompany] = useState(3);
  const [yearsInCurrentRole, setYearsInCurrentRole] = useState(2);
  const [yearsSincePromotion, setYearsSincePromotion] = useState(1);
  const [satisfactionScore, setSatisfactionScore] = useState(3);
  const [environmentSatisfaction, setEnvironmentSatisfaction] = useState(3);
  const [workLifeBalance, setWorkLifeBalance] = useState(3);
  const [hasOvertime, setHasOvertime] = useState(false);
  const [overtimeHoursWeekly, setOvertimeHoursWeekly] = useState(0);
  const [distanceFromHomeKm, setDistanceFromHomeKm] = useState(12);
  const [performanceRating, setPerformanceRating] = useState(3);
  const [remoteWorkOption, setRemoteWorkOption] = useState<'Full-time' | 'Hybrid' | 'On-site'>('Hybrid');

  // Handle department change & update role options
  const handleDeptChange = (dept: string) => {
    setDepartment(dept);
    const availableRoles = ROLES_BY_DEPT[dept] || ['Specialist'];
    setRole(availableRoles[0]);
  };

  // Real-time ML Prediction
  const livePrediction = useMemo(() => {
    const partial: Partial<Employee> = {
      department,
      role,
      monthlySalary,
      satisfactionScore,
      environmentSatisfaction,
      workLifeBalance,
      hasOvertime: hasOvertime || overtimeHoursWeekly > 0,
      overtimeHoursWeekly: hasOvertime ? (overtimeHoursWeekly || 10) : 0,
      yearsAtCompany,
      yearsSincePromotion,
      distanceFromHomeKm,
      performanceRating,
    };

    return predictAttritionProbability(partial);
  }, [
    department,
    role,
    monthlySalary,
    satisfactionScore,
    environmentSatisfaction,
    workLifeBalance,
    hasOvertime,
    overtimeHoursWeekly,
    yearsAtCompany,
    yearsSincePromotion,
    distanceFromHomeKm,
    performanceRating,
  ]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Determine primary risk factor
    let primaryRiskFactor = 'Competitive Compensation';
    if (hasOvertime && overtimeHoursWeekly > 8) {
      primaryRiskFactor = 'Chronic Overtime Strain';
    } else if (satisfactionScore <= 2) {
      primaryRiskFactor = 'Low Job Satisfaction';
    } else if (workLifeBalance <= 2) {
      primaryRiskFactor = 'Work-Life Balance Burnout';
    } else if (yearsSincePromotion >= 3) {
      primaryRiskFactor = 'Stagnant Career Trajectory';
    } else if (distanceFromHomeKm > 30) {
      primaryRiskFactor = 'Excessive Commute Distance';
    } else if (monthlySalary < 60000) {
      primaryRiskFactor = 'Below Market Compensation';
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newId = `EMP-${randomSuffix}`;
    const cleanEmail = `${name.toLowerCase().replace(/[^a-z0-9]/g, '.') || 'staff'}@shopai.enterprise`;

    const newEmp: Employee = {
      id: newId,
      name: name.trim(),
      email: cleanEmail,
      avatar: '', // Note: No avatar/logo
      department,
      role,
      age: Number(age) || 30,
      gender,
      education,
      yearsAtCompany: Number(yearsAtCompany) || 1,
      yearsInCurrentRole: Number(yearsInCurrentRole) || 1,
      yearsSincePromotion: Number(yearsSincePromotion) || 0,
      monthlySalary: Number(monthlySalary) || 50000,
      satisfactionScore: Number(satisfactionScore),
      environmentSatisfaction: Number(environmentSatisfaction),
      workLifeBalance: Number(workLifeBalance),
      hasOvertime: Boolean(hasOvertime || overtimeHoursWeekly > 0),
      overtimeHoursWeekly: hasOvertime ? (Number(overtimeHoursWeekly) || 10) : 0,
      performanceRating: Number(performanceRating),
      distanceFromHomeKm: Number(distanceFromHomeKm),
      trainingTimesLastYear: 2,
      managerRelationshipScore: 3,
      remoteWorkOption,
      attritionRisk: livePrediction.risk,
      riskLevel: livePrediction.riskLevel,
      primaryRiskFactor,
    };

    onAddEmployee(newEmp);
    onClose();
  };

  const isHigh = livePrediction.riskLevel === 'high';
  const isMed = livePrediction.riskLevel === 'medium';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 my-8 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Add New Employee
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter employee details to see their chance of staying or leaving the company
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Basic Identity & Placement */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-1.5">
              <span>1. Basic Details & Department</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Employee Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Department *
                </label>
                <select
                  value={department}
                  onChange={(e) => handleDeptChange(e.target.value)}
                  className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-100"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Job Role / Title *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-100"
                >
                  {(ROLES_BY_DEPT[department] || ['Specialist']).map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Work Style (Office / Remote / Hybrid)
                </label>
                <select
                  value={remoteWorkOption}
                  onChange={(e) => setRemoteWorkOption(e.target.value as any)}
                  className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-100"
                >
                  <option value="Hybrid">Hybrid (Part Office, Part Home)</option>
                  <option value="Full-time">Full-time Work from Home</option>
                  <option value="On-site">Work from Office</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min="18"
                  max="70"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-100"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Compensation & Tenure */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-1.5">
              <span>2. Salary & Experience at Company</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Monthly Salary in Rupees (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="15000"
                    step="5000"
                    required
                    value={monthlySalary}
                    onChange={(e) => setMonthlySalary(Number(e.target.value))}
                    className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-7 pr-3 text-xs font-medium text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Years Worked at Company
                </label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  step="0.5"
                  value={yearsAtCompany}
                  onChange={(e) => setYearsAtCompany(Number(e.target.value))}
                  className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Years Since Last Promotion (0 = This Year)
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={yearsSincePromotion}
                  onChange={(e) => setYearsSincePromotion(Number(e.target.value))}
                  className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Key ML Risk Factors */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-1.5">
              <span>3. Happiness & Workload (Main Reasons People Stay or Leave)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Job Happiness & Satisfaction (1 to 5)
                  </label>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {satisfactionScore} of 5
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={satisfactionScore}
                  onChange={(e) => setSatisfactionScore(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:bg-slate-700"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>1 (Unhappy)</span>
                  <span>5 (Very Happy)</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Work-Life Balance (1 to 5)
                  </label>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {workLifeBalance} of 5
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={workLifeBalance}
                  onChange={(e) => setWorkLifeBalance(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:bg-slate-700"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>1 (Poor Balance)</span>
                  <span>5 (Great Balance)</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Office Environment (1 to 5)
                  </label>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {environmentSatisfaction} of 5
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={environmentSatisfaction}
                  onChange={(e) => setEnvironmentSatisfaction(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:bg-slate-700"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>1 (Needs Work)</span>
                  <span>5 (Excellent)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Travel Distance to Office (km)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={distanceFromHomeKm}
                  onChange={(e) => setDistanceFromHomeKm(Number(e.target.value))}
                  className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Does Employee Work Extra Hours (Overtime)?
                </label>
                <div className="flex items-center gap-3 h-9">
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="hasOvertime"
                      checked={!hasOvertime}
                      onChange={() => {
                        setHasOvertime(false);
                        setOvertimeHoursWeekly(0);
                      }}
                      className="text-indigo-600"
                    />
                    <span>No (Normal hours only)</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="hasOvertime"
                      checked={hasOvertime}
                      onChange={() => {
                        setHasOvertime(true);
                        if (overtimeHoursWeekly === 0) setOvertimeHoursWeekly(10);
                      }}
                      className="text-indigo-600"
                    />
                    <span>Yes (Works Overtime)</span>
                  </label>
                </div>
              </div>

              {hasOvertime && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Extra Overtime Hours per Week
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={overtimeHoursWeekly}
                    onChange={(e) => setOvertimeHoursWeekly(Number(e.target.value))}
                    className="h-9 w-full rounded-xl border border-rose-300 bg-rose-50/50 px-3 text-xs font-semibold text-rose-700 focus:border-rose-500 focus:outline-hidden dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Live ML Risk Preview Card */}
          <div
            className={`rounded-2xl border p-4 transition-all ${
              isHigh
                ? 'border-rose-300 bg-rose-50/60 dark:border-rose-900/60 dark:bg-rose-950/30'
                : isMed
                ? 'border-amber-300 bg-amber-50/60 dark:border-amber-900/60 dark:bg-amber-950/30'
                : 'border-emerald-300 bg-emerald-50/60 dark:border-emerald-900/60 dark:bg-emerald-950/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Instant Prediction: Chance of Leaving
                </span>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold uppercase border ${
                  isHigh
                    ? 'border-rose-300 bg-rose-100 text-rose-700 dark:border-rose-800 dark:bg-rose-900 dark:text-rose-200'
                    : isMed
                    ? 'border-amber-300 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-900 dark:text-amber-200'
                    : 'border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                }`}
              >
                {isHigh ? 'High Risk of Leaving' : isMed ? 'Medium Risk of Leaving' : 'Safe / Likely to Stay'} ({Math.round(livePrediction.risk * 100)}%)
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Based on this employee's details, there is a{' '}
              <strong>{Math.round(livePrediction.risk * 100)}% chance they might leave the company</strong>.
              {isHigh && ' Main reasons: low job happiness or too much overtime work.'}
              {isMed && ' Moderate risk: Good to check in with them and discuss their workload.'}
              {!isHigh && !isMed && ' This employee looks happy and satisfied with their current job.'}
            </p>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition-all hover:scale-[1.01]"
            >
              <UserPlus className="h-4 w-4" />
              Save & Add Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
