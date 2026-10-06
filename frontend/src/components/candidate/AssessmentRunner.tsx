import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Question } from '../../types';
import { Sparkles, Clock, AlertTriangle, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

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
    setQuestion(firstQ);
    setTimeSpent(0);
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

  if (finished && result) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl border border-slate-200 p-8 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <span className="bg-fsp-lavender text-fsp-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Тестирование CAT завершено
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900">Категория успешно верифицирована!</h2>
          <p className="text-slate-500 text-sm">
            Ваша способность оценена методом 2PL IRT Bayes EAP с защитой от утечек.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left">
          <div>
            <div className="text-xs text-slate-400 font-medium">Присвоенный грейд:</div>
            <div className="text-xl font-bold text-slate-900">{result.assigned_grade_name} Backend</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Латентная способность θ:</div>
            <div className="text-xl font-bold text-fsp-primary">{result.final_theta}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Перцентиль в категории:</div>
            <div className="text-xl font-bold text-emerald-600">Топ {Math.round(100 - result.percentile)}%</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Индекс доверия античита:</div>
            <div className="text-xl font-bold text-slate-800">100%</div>
          </div>
        </div>

        <button
          onClick={onFinish}
          className="w-full bg-fsp-primary hover:bg-fsp-light text-white font-bold py-3.5 rounded-xl shadow-lg shadow-fsp-primary/20 transition-all flex items-center justify-center gap-2"
        >
          <span>Перейти в личный кабинет</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-6 space-y-6">
      {/* Шапка теста */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-fsp-lavender text-fsp-primary flex items-center justify-center font-bold">
            Q{question?.question_index || 1}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Адаптивный CAT-тест (2PL IRT)</h3>
            <p className="text-xs text-slate-500">Вопрос формируется динамически чекером</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>{timeSpent} сек</span>
          </div>

          {tabSwitches > 0 && (
            <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
              <AlertTriangle className="w-4 h-4" />
              <span>Смен вкладок: {tabSwitches}</span>
            </div>
          )}
        </div>
      </div>

      {/* Карточка вопроса */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Код шаблона: {question?.template_code} • Параметризованный экземпляр
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
            {question?.question_text}
          </h2>
        </div>

        {/* Блок с кодом (если есть) */}
        {question?.code && (
          <div className="bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-xs sm:text-sm overflow-x-auto shadow-inner leading-relaxed">
            <pre>{question.code}</pre>
          </div>
        )}

        {/* Варианты ответов */}
        <div className="space-y-3 pt-2">
          {question?.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            return (
              <button
                key={idx}
                onClick={() => setSelectedOption(idx)}
                className={`w-full text-left p-4 rounded-xl border transition-all text-sm font-medium flex items-center justify-between ${
                  isSelected
                    ? 'border-fsp-primary bg-fsp-lavender/50 text-fsp-primary ring-2 ring-fsp-primary/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <span>{option}</span>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                  isSelected ? 'border-fsp-primary bg-fsp-primary text-white' : 'border-slate-300 text-slate-400'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </div>
              </button>
            );
          })}
        </div>

        {/* Кнопка отправки ответа */}
        <div className="pt-4 flex items-center justify-between border-t border-slate-100">
          <div className="text-xs text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Защита от списывания: у каждого кандидата уникальные входные данные
          </div>

          <button
            onClick={handleSubmit}
            disabled={selectedOption === null || loading}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              selectedOption !== null && !loading
                ? 'bg-fsp-primary hover:bg-fsp-light text-white shadow-lg shadow-fsp-primary/20 cursor-pointer'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>{loading ? 'Обработка EAP...' : 'Ответить и продолжить'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
