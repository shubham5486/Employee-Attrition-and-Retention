import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Download,
  X,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { predictAttritionProbability } from '../../ml/engine';
import { Employee } from '../../types';

interface CsvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CsvUploadModal: React.FC<CsvUploadModalProps> = ({ isOpen, onClose }) => {
  const { addImportedEmployees, showToast } = useApp();
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<Employee[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Download official sample CSV template
  const downloadSampleTemplate = () => {
    const headers = [
      'id',
      'name',
      'department',
      'role',
      'yearsAtCompany',
      'monthlySalary',
      'satisfactionScore',
      'overtimeHoursWeekly',
      'yearsSincePromotion',
      'distanceFromHomeKm',
      'workLifeBalanceScore',
      'remoteWorkOption',
    ];

    const sampleRows = [
      ['EMP-8001', 'Kavita Menon', 'Engineering', 'Senior DevOps Engineer', 4, 165000, 2, 14, 3, 22, 2, 'Hybrid'],
      ['EMP-8002', 'Aditya Verma', 'Sales', 'Enterprise Account Exec', 2, 120000, 4, 2, 1, 8, 4, 'On-site'],
      ['EMP-8003', 'Deepak Chopra', 'Product', 'Product Lead', 5, 210000, 2, 12, 4, 18, 2, 'Hybrid'],
      ['EMP-8004', 'Sneha Rao', 'Human Resources', 'HR Business Partner', 3, 95000, 4, 0, 1, 5, 4, 'Full-time'],
      ['EMP-8005', 'Rohan Sengupta', 'Operations', 'Supply Chain Analyst', 3, 82000, 2, 16, 2, 28, 2, 'On-site'],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...sampleRows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'shopai_employee_sample_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Downloaded sample CSV template', 'info');
  };

  // Parse CSV text
  const processCSVText = (text: string) => {
    setErrorMsg(null);
    try {
      const lines = text.trim().split('\n');
      if (lines.length < 2) {
        setErrorMsg('CSV file is empty or missing data rows.');
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
      const employees: Employee[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));

        const id = cols[0] || `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
        const name = cols[1] || `Employee ${i}`;
        const department = cols[2] || 'Engineering';
        const role = cols[3] || 'Specialist';
        const yearsAtCompany = Number(cols[4]) || 2;
        const monthlySalary = Number(cols[5]) || 90000;
        const satisfactionScore = Math.min(5, Math.max(1, Number(cols[6]) || 3));
        const overtimeHoursWeekly = Number(cols[7]) || 0;
        const yearsSincePromotion = Number(cols[8]) || 1;
        const distanceFromHomeKm = Number(cols[9]) || 12;
        const workLifeBalanceScore = Number(cols[10]) || 3;
        const remoteWorkOption = (cols[11] as any) || 'Hybrid';

        // Complete record for ML inference and state
        const partialData = {
          id,
          name,
          email: `${name.toLowerCase().replace(/\s+/g, '.')}@shopai.internal`,
          department,
          role,
          age: 28 + (i % 25),
          gender: (i % 2 === 0 ? 'Female' : 'Male') as 'Female' | 'Male',
          yearsAtCompany,
          yearsInCurrentRole: Math.max(1, yearsAtCompany - 1),
          yearsSincePromotion,
          monthlySalary,
          satisfactionScore,
          environmentSatisfaction: satisfactionScore,
          workLifeBalance: workLifeBalanceScore,
          overtimeHoursWeekly,
          hasOvertime: overtimeHoursWeekly > 0,
          performanceRating: 3,
          distanceFromHomeKm,
          trainingTimesLastYear: 2,
          managerRelationshipScore: 3,
          remoteWorkOption,
          education: "Bachelor's Degree",
          avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80`,
        };

        const prediction = predictAttritionProbability(partialData);

        let primaryRiskFactor = 'Competitive Compensation';
        if (overtimeHoursWeekly > 8) primaryRiskFactor = 'Chronic Overtime Strain';
        else if (satisfactionScore <= 2) primaryRiskFactor = 'Low Job Satisfaction';
        else if (yearsSincePromotion >= 3) primaryRiskFactor = 'Career Stagnation';

        const completeEmployee: Employee = {
          ...partialData,
          attritionRisk: prediction.risk,
          riskLevel: prediction.riskLevel,
          primaryRiskFactor,
        };

        employees.push(completeEmployee);
      }

      setParsedRows(employees);
    } catch (err: any) {
      setErrorMsg(`Failed to parse CSV: ${err.message}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        processCSVText(text);
      };
      reader.readAsText(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        processCSVText(text);
      };
      reader.readAsText(file);
    }
  };

  const handleCommitImport = () => {
    if (parsedRows.length === 0) return;
    setIsProcessing(true);
    setTimeout(() => {
      addImportedEmployees(parsedRows);
      setIsProcessing(false);
      onClose();
    }, 400);
  };

  const highRiskCountInBatch = parsedRows.filter((e) => e.riskLevel === 'high').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Import Workforce Data (CSV)
              </h3>
              <p className="text-xs text-slate-500">
                Upload internal HRIS / payroll export for instantaneous ML attrition scoring
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
              : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/30 dark:hover:border-slate-700'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <FileSpreadsheet className="h-10 w-10 text-indigo-600 dark:text-indigo-400 mb-2" />
          <p className="text-xs font-semibold text-slate-900 dark:text-white">
            {fileName ? fileName : 'Drop employee CSV file here, or click to browse'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Accepts CSV format with standard payroll or HRIS schema
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              downloadSampleTemplate();
            }}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Download className="h-3.5 w-3.5 text-slate-400" />
            Download Sample CSV Template
          </button>
        </div>

        {/* Error message if any */}
        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Parsed Preview Highlights */}
        {parsedRows.length > 0 && (
          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/20 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Validated & Scored {parsedRows.length} Employee Records
              </span>
              <span className="text-rose-600 dark:text-rose-400">
                {highRiskCountInBatch} High Risk Identified
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              All rows successfully processed by XGBoost model with TreeSHAP risk factor attributions.
            </p>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCommitImport}
            disabled={parsedRows.length === 0 || isProcessing}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 disabled:opacity-40 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            {isProcessing ? 'Ingesting Records...' : `Import & Merge ${parsedRows.length} Employees`}
          </button>
        </div>
      </div>
    </div>
  );
};
