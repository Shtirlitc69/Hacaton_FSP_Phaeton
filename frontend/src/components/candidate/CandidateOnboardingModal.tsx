import React, { useState, useEffect } from 'react';
import { Award, Sparkles, ArrowRight, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStartTest: (spec: string, grade: string) => void;
  onSaveProfile: (data: any) => void;
}

export const CandidateOnboardingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onStartTest,
  onSaveProfile
}) => {
  const [specSlug, setSpecSlug] = useState('backend');
  const [gradeSlug, setGradeSlug] = useState('middle');
  const [salaryFrom, setSalaryFrom] = useState(180000);
  const [salaryTo, setSalaryTo] = useState(230000);
  const [fspId, setFspId] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFinish = (andTest: boolean) => {
    onSaveProfile({
      preferred_salary_from: salaryFrom,
      preferred_salary_to: salaryTo,
      fsp_id: fspId
    });

    if (andTest) {
      onStartTest(specSlug, gradeSlug);
    }
    onClose();
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-[#0B0F19] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-[10px] font-mono tracking-widest uppercase text-blue-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ОНБОРДИНГ СОИСКАТЕЛЯ • 152-ФЗ</span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-white mt-1">
            Настройка профиля и выбор грейда
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Согласно ТЗ, категория определяется не резюме, а выбором направления и результатом теста
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Шаг 1: Специализация */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold uppercase text-slate-600">
              1. Ваша специализация:
            </label>
            <select
              value={specSlug}
              onChange={(e) => setSpecSlug(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
            >
              <option value="backend">Backend-разработка (Python, Go, Java)</option>
              <option value="frontend">Frontend-разработка (React, TypeScript)</option>
              <option value="ml">Machine Learning & AI (PyTorch, LLM, MLOps)</option>
              <option value="devops">DevOps & Cloud Infrastructure (Kubernetes, CI/CD)</option>
            </select>
          </div>

          {/* Шаг 2: Заявляемый грейд */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold uppercase text-slate-600">
              2. Заявляемый уровень квалификации (грейд):
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { slug: 'junior', name: 'Junior', desc: 'До 1 года' },
                { slug: 'middle', name: 'Middle', desc: 'С опытом' },
                { slug: 'senior', name: 'Senior', desc: 'Ведущий' },
              ].map((g) => (
                <button
                  key={g.slug}
                  type="button"
                  onClick={() => setGradeSlug(g.slug)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    gradeSlug === g.slug
                      ? 'border-blue-600 bg-blue-50/70 text-slate-900 ring-1 ring-blue-600'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold">{g.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{g.desc}</div>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">
              💡 Грейд официально присваивается только по результатам адаптивного CAT-теста.
            </p>
          </div>

          {/* Шаг 3: Зарплатные ожидания */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold uppercase text-slate-600">
              3. Желаемая зарплатная вилка (чистыми на руки, ₽):
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  step="5000"
                  value={salaryFrom}
                  onChange={(e) => setSalaryFrom(Number(e.target.value))}
                  placeholder="От"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
              <div>
                <input
                  type="number"
                  step="5000"
                  value={salaryTo}
                  onChange={(e) => setSalaryTo(Number(e.target.value))}
                  placeholder="До"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Шаг 4: ID участника ФСП (опционально) */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold uppercase text-slate-600 flex items-center justify-between">
              <span>4. ID участника ФСП (опционально):</span>
              <Award className="w-3.5 h-3.5 text-amber-600" />
            </label>
            <input
              type="text"
              value={fspId}
              onChange={(e) => setFspId(e.target.value)}
              placeholder="Например: FSP-RU-2024-1001"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
            <p className="text-[10px] text-slate-400">
              Дает автоматический бонус ранжирования (+15%) при совпадении с реестром Чемпионата России.
            </p>
          </div>

          {/* Кнопки завершения */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
            <button
              onClick={() => handleFinish(false)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
            >
              Сохранить без теста
            </button>
            <button
              onClick={() => handleFinish(true)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Подтвердить грейд (CAT-тест)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
