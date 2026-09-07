import React, { useState } from 'react';
import {
  Cpu,
  RefreshCw,
  CheckCircle2,
  TrendingUp,
  Sliders,
  Sparkles,
  BarChart2,
  Layers,
  Award,
  Zap,
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
import { GLOBAL_FEATURE_IMPORTANCE } from '../../ml/engine';

export const ModelStudio: React.FC = () => {
  const { mlModelStats, retrainModel, isRetraining, showToast } = useApp();
  const [selectedModel, setSelectedModel] = useState<string>('XGBoost Classifier');

  const modelsComparison = [
    {
      name: 'XGBoost Classifier (Active)',
      accuracy: 94.2,
      precision: 91.8,
      recall: 89.4,
      f1: 90.6,
      rocAuc: 0.948,
      trainingTime: '1.4s',
      status: 'Active in Production',
      isEnsemble: true,
    },
    {
      name: 'Random Forest Classifier',
      accuracy: 91.6,
      precision: 88.2,
      recall: 86.1,
      f1: 87.1,
      rocAuc: 0.921,
      trainingTime: '2.8s',
      status: 'Benchmark Alternative',
      isEnsemble: true,
    },
    {
      name: 'Logistic Regression (L2)',
      accuracy: 84.5,
      precision: 79.3,
      recall: 76.8,
      f1: 78.0,
      rocAuc: 0.842,
      trainingTime: '0.3s',
      status: 'Linear Baseline',
      isEnsemble: false,
    },
  ];

  // ROC Curve points (FPR vs TPR)
  const rocCurveData = [
    { fpr: 0.0, tpr: 0.0, baseline: 0.0 },
    { fpr: 0.05, tpr: 0.62, baseline: 0.05 },
    { fpr: 0.1, tpr: 0.81, baseline: 0.1 },
    { fpr: 0.2, tpr: 0.91, baseline: 0.2 },
    { fpr: 0.3, tpr: 0.95, baseline: 0.3 },
    { fpr: 0.5, tpr: 0.98, baseline: 0.5 },
    { fpr: 1.0, tpr: 1.0, baseline: 1.0 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <Cpu className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              ML Model Studio & Explainability Engine
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Model performance validation, cross-validation metrics, global TreeSHAP weights & live retraining pipeline
          </p>
        </div>

        <button
          onClick={retrainModel}
          disabled={isRetraining}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 disabled:opacity-50 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${isRetraining ? 'animate-spin' : ''}`} />
          {isRetraining ? 'Retraining Ensemble (5-Fold CV)...' : 'Retrain Production Model'}
        </button>
      </div>

      {/* Model Performance Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Model Accuracy</div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {mlModelStats.accuracy}%
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">5-Fold Cross-Validated</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Precision (Positive)</div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {mlModelStats.precision}%
          </div>
          <span className="text-[11px] text-slate-500">Low false alarm rate</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Recall (Sensitivity)</div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {mlModelStats.recall}%
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Catches 89.4% of departures</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">ROC-AUC Score</div>
          <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
            {mlModelStats.rocAuc}
          </div>
          <span className="text-[11px] text-slate-500">Industry leading benchmark</span>
        </div>
      </div>

      {/* Model Benchmark Comparison Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Algorithm Benchmark Comparison
            </h3>
            <p className="text-xs text-slate-500">
              Evaluated on 520 stratified employee records across 18 feature dimensions
            </p>
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            Current Champion: XGBoost
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3">Algorithm</th>
                <th className="py-3 px-3">Accuracy</th>
                <th className="py-3 px-3">Precision</th>
                <th className="py-3 px-3">Recall</th>
                <th className="py-3 px-3">F1-Score</th>
                <th className="py-3 px-3">ROC-AUC</th>
                <th className="py-3 px-3">Latency</th>
                <th className="py-3 px-3 text-right">Production Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {modelsComparison.map((m) => (
                <tr key={m.name} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    {m.isEnsemble && <Zap className="h-3.5 w-3.5 text-amber-500" />}
                    {m.name}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">{m.accuracy}%</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{m.precision}%</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{m.recall}%</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{m.f1}%</td>
                  <td className="py-3 px-3 font-bold text-indigo-600 dark:text-indigo-400">{m.rocAuc}</td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-400">{m.trainingTime}</td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        m.name.includes('Active')
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 2: Global Feature Importance & ROC Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Global SHAP Feature Importance (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Global TreeSHAP Feature Importance
              </h3>
              <p className="text-xs text-slate-500">
                Mean absolute SHAP value impact across the entire employee dataset
              </p>
            </div>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
              Ranked Predictors
            </span>
          </div>

          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={GLOBAL_FEATURE_IMPORTANCE}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" unit="%" tick={{ fontSize: 10 }} />
                <YAxis dataKey="feature" type="category" tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`${val}% relative weight`, 'Feature Importance']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="importance" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={16}>
                  {GLOBAL_FEATURE_IMPORTANCE.map((entry, index) => (
                    <Cell
                      key={`feat-${index}`}
                      fill={index === 0 ? '#f43f5e' : index === 1 ? '#ea580c' : '#4f46e5'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ROC-AUC Curve (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Receiver Operating Characteristic (ROC)
              </h3>
              <p className="text-xs text-slate-500">
                True Positive Rate vs False Positive Rate (AUC = 0.948)
              </p>
            </div>
          </div>

          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rocCurveData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="fpr" tick={{ fontSize: 10 }} domain={[0, 1]} />
                <YAxis tick={{ fontSize: 10 }} domain={[0, 1]} />
                <Tooltip
                  formatter={(val: any, name: any) => [`${val}`, name === 'tpr' ? 'XGBoost TPR' : 'Random Guess']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Line type="monotone" dataKey="tpr" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} name="tpr" />
                <Line type="monotone" dataKey="baseline" stroke="#94a3b8" strokeDasharray="3 3" dot={false} name="baseline" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
