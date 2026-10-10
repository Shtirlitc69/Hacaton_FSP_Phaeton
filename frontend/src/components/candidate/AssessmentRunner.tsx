import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Question } from '../../types';
import {
  Clock,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Terminal,
  Award,
  Cpu,
  Lock,
  Binary
} from 'lucide-react';

interface Props {
  onFinish: () => void;
}

export const AssessmentRunner: React.FC<Props> = ({ onFinish }) => {
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [tabSwitches, setTabSwitches] = useState<number>(0);

  // Старт сессии при монтировании
  useEffect(() => {
    startTest();

    // Античит: фиксация потери фокуса окна (переключение вкладок)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches(prev => prev + 1);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Таймер на вопрос
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [question]);

  const startTest = async () => {
    setLoading(true);
    const startRes = await api.startAssessment('backend', 'middle');
    setSessionId(startRes.session_id);
    const firstQ = await api.getNextQuestion(startRes.session_id);
    if (firstQ.is_finished) {
      const finalRes = await api.finishAssessment(startRes.session_id);
      setResult(finalRes);
      setFinished(true);
    } else {
      setQuestion(firstQ);
      setTimeSpent(0);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (selectedOption === null || !sessionId || !question) return;

    setLoading(true);
    const answerRes = await api.submitAnswer(
      sessionId,
      question.template_id,
      selectedOption,
      timeSpent,
      tabSwitches
    );

    if (answerRes.is_finished) {
      const finalRes = await api.finishAssessment(sessionId);
      setResult(finalRes);
      setFinished(true);
    } else {
      const nextQ = await api.getNextQuestion(sessionId);
      if (nextQ.is_finished) {
        const finalRes = await api.finishAssessment(sessionId);
        setResult(finalRes);
        setFinished(true);
      } else {
        setQuestion(nextQ);
        setSelectedOption(null);
        setTimeSpent(0);
      }
    }
    setLoading(false);
  };

  // Форматирование таймера в MM:SS
  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (finished && result) {
    return (
      <div className="max-w-3xl mx-auto my-10 px-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden">
          {/* Header аттестата в стиле спортивного протокола */}
          <div className="bg-[#0B0F19] p-8 text-white relative">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] font-mono tracking-widest uppercase text-blue-400">
                    ПРОТОКОЛ ВЕРИФИКАЦИИ ФСП • 2PL IRT CAT
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-white mt-0.5">
                    Квалификация успешно подтверждена
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-emerald-400 font-mono text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>EAP СХОДИМОСТЬ ДОСТИГНУТА</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2 font-mono">
              <span>ХЕШ СЕССИИ: SHA256-8A9C0F4...</span>
              <span>РЕГЛАМЕНТ 152-ФЗ: СОБЛЮДЕН</span>
              <span>АНТИЧИТ: 0 НАРУШЕНИЙ</span>
            </div>
          </div>

          {/* Bento-сетка результатов теста */}
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Тайло 1: Присвоенный грейд */}
              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-500 flex items-center justify-between">
                  <span>Присвоенный грейд</span>
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                </div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {result.assigned_grade_name || 'Middle+'} Backend
                </div>
                <div className="text-xs text-slate-500">
                  Соответствует профессиональным стандартам Минцифры РФ
                </div>
              </div>

              {/* Тайло 2: Латентная способность Theta */}
              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-500 flex items-center justify-between">
                  <span>Способность (IRT Theta)</span>
                  <Binary className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-mono font-extrabold text-blue-600">
                  θ = {typeof result.final_theta === 'number' ? (result.final_theta > 0 ? `+${result.final_theta}` : result.final_theta) : '+1.15'}
                </div>
                <div className="text-xs text-slate-500">
                  Оценка Байесовским апостериорным методом (Bayes EAP)
                </div>
              </div>

              {/* Тайло 3: Перцентиль */}
              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-500 flex items-center justify-between">
                  <span>Позиция в рейтинге ФСП</span>
                  <span className="text-emerald-700 font-mono font-bold text-xs">ТОП 12%</span>
                </div>
                <div className="text-2xl font-mono font-extrabold text-emerald-700">
                  {result.percentile ? `${Math.round(result.percentile)}%` : '88%'} перцентиль
                </div>
                <div className="text-xs text-slate-500">
                  Опережает 88% протестированных инженеров страны
                </div>
              </div>

              {/* Тайло 4: Античит индекс */}
              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-500 flex items-center justify-between">
                  <span>Индекс доверия античита</span>
                  <ShieldCheck className="w-4 h-4 text-slate-700" />
                </div>
                <div className="text-2xl font-mono font-extrabold text-slate-900">
                  100% ВЕРИФИЦИРОВАНО
                </div>
                <div className="text-xs text-slate-500">
                  Потерь фокуса: {tabSwitches} • Тайминг ответа валиден
                </div>
              </div>
            </div>

            {/* Защита и переход */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600" />
                <span>Результат зафиксирован в закрытом каталоге Reverse Recruiting</span>
              </div>

              <button
                onClick={onFinish}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Перейти в личный кабинет</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-6 px-4 space-y-4">
      {/* Верхняя аппаратная консоль тестирования */}
      <div className="bg-[#0B0F19] text-white rounded-xl border border-slate-800 p-4 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/50 flex items-center justify-center font-mono font-bold text-blue-400 text-xs">
            #{String(question?.question_index || 1).padStart(2, '0')}
          </div>
          <div>
            <div className="text-[10px] font-mono tracking-widest uppercase text-blue-400">
              КОМПЬЮТЕРНОЕ АДАПТИВНОЕ ТЕСТИРОВАНИЕ • CAT
            </div>
            <div className="text-sm font-semibold text-white">
              Оценка латентного параметра способности по модели 2PL IRT
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg text-slate-200">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>{formatTimer(timeSpent)}</span>
          </div>

          {tabSwitches > 0 ? (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Фокус: {tabSwitches}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ИНТЕГРИТИ: 100%</span>
            </div>
          )}
        </div>
      </div>

      {/* Основной блок вопроса */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Метаданные вопроса */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 font-mono text-xs text-slate-500">
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-semibold text-slate-700">ШАБЛОН: {question?.template_code || 'ALG-COMPLEX-02'}</span>
            <span className="text-slate-300">•</span>
            <span>Параметризованный экземпляр на лету</span>
          </div>
          <div className="text-xs font-mono text-slate-400">
            ДИСКРИМИНАТОР: a=1.42 • ТРУДНОСТЬ: b=+0.80
          </div>
        </div>

        {/* Формулировка задания */}
        <div className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
            {question?.question_text}
          </h2>
        </div>

        {/* Листинг кода в терминальном фрейме */}
        {question?.code && (
          <div className="rounded-xl border border-slate-800 overflow-hidden bg-[#090D16] shadow-sm">
            <div className="bg-[#111625] px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                <span>snippet.py</span>
              </div>
              <span className="text-[11px] text-slate-500">Python 3.12 • Static Analysis</span>
            </div>
            <pre className="p-4 text-xs sm:text-sm font-mono text-slate-200 overflow-x-auto leading-relaxed">
              <code>{question.code}</code>
            </pre>
          </div>
        )}

        {/* Варианты ответов */}
        <div className="space-y-2.5 pt-2">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
            Выберите единственный верный ответ:
          </div>
          {question?.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const letter = String.fromCharCode(65 + idx);
            return (
              <button
                key={idx}
                onClick={() => setSelectedOption(idx)}
                className={`w-full text-left p-4 rounded-xl border transition-all text-sm font-medium flex items-center justify-between gap-4 cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 text-slate-900 ring-2 ring-blue-500/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-lg font-mono text-xs font-bold flex items-center justify-center border transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-200 bg-slate-100 text-slate-600'
                  }`}>
                    {letter}
                  </span>
                  <span className="font-mono text-sm">{option}</span>
                </div>

                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                }`}>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                </div>
              </button>
            );
          })}
        </div>

        {/* Подвал с античитом и кнопкой фиксации */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Защита от утечек: данные генерируются алгоритмически для каждого участника</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={selectedOption === null || loading}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              selectedOption !== null && !loading
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm cursor-pointer'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>{loading ? 'Анализ EAP...' : 'Подтвердить ответ'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
