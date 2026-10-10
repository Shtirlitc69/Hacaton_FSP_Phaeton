import React, { useState } from 'react';
import { DailyChallenge } from '../../types';
import { api } from '../../lib/api';
import { Sparkles, Award, CheckCircle2, Terminal, ArrowRight } from 'lucide-react';

interface Props {
  challenges: DailyChallenge[];
  candidateId: number;
  onRefresh: () => void;
  onToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

export const DailyChallengesView: React.FC<Props> = ({ challenges, candidateId, onRefresh, onToast }) => {
  const [activeChallengeId, setActiveChallengeId] = useState<number | null>(challenges[0]?.id || null);
  const [solutionText, setSolutionText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completedMap, setCompletedMap] = useState<Record<number, boolean>>({
    2: true // Демо-завершенное
  });

  const handleSubmit = async (id: number) => {
    if (!solutionText.trim()) {
      onToast('Внимание', 'Пожалуйста, опишите ваше решение или код перед отправкой', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.submitDailyChallenge(id, candidateId, solutionText);
      setCompletedMap(prev => ({ ...prev, [id]: true }));
      setSolutionText('');
      onToast(
        'Задача успешно решена!',
        res.message || 'Присвоен бейдж активности ФСП, профиль обновлен (+10% к фактору свежести).',
        'success'
      );
      onRefresh();
    } catch (e) {
      onToast('Ошибка', 'Не удалось отправить решение', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedChallenge = challenges.find(c => c.id === activeChallengeId) || challenges[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8 space-y-6 animate-fade-in">
      {/* Шапка раздела */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-blue-600 font-bold">
            <Sparkles className="w-4 h-4" />
            <span>Регулярные задания • Актуальность профиля (Бонус 7%)</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
            Микро-челленджи от работодателей
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Периодические короткие задачи от ведущих ИТ-команд. Решение даёт свежий сигнал о вашей квалификации и повышает позицию в поиске.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3.5 py-2 rounded-xl text-blue-700 text-xs font-semibold font-mono">
          <Award className="w-4 h-4 text-blue-600" />
          <span>БОНУС СВЕЖЕСТИ: +10% В СКОРИНГЕ</span>
        </div>
      </div>

      {/* Основная сетка: выбор задачи слева, редактор решения справа */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Список задач */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold px-1">
            Доступные задания дня:
          </div>

          {challenges.map((ch) => {
            const isSelected = ch.id === selectedChallenge?.id;
            const isDone = completedMap[ch.id] || ch.is_completed;

            return (
              <div
                key={ch.id}
                onClick={() => { setActiveChallengeId(ch.id); setSolutionText(''); }}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-white ring-2 ring-blue-500/10 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase">
                      ID ЗАДАЧИ: #{String(ch.id).padStart(3, '0')}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5 leading-snug">
                      {ch.title}
                    </h4>
                  </div>

                  {isDone ? (
                    <span className="shrink-0 p-1 rounded-full bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      АКТИВНО
                    </span>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-blue-600">
                    <Award className="w-3.5 h-3.5" />
                    <span>{ch.reward_badge}</span>
                  </div>
                  <span className="text-[11px] font-mono">{ch.created_at}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Рабочая область выбранной задачи */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-5">
          {selectedChallenge ? (
            <>
              <div className="pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
                  <Terminal className="w-3.5 h-3.5 text-blue-600" />
                  <span>УСЛОВИЕ ЗАДАЧИ</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {selectedChallenge.title}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {selectedChallenge.description}
                </p>
              </div>

              {completedMap[selectedChallenge.id] || selectedChallenge.is_completed ? (
                <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold text-emerald-900">Вы успешно подтвердили эту задачу!</h4>
                  <p className="text-xs text-emerald-700">
                    Бейдж «{selectedChallenge.reward_badge}» активирован в вашем профиле соискателя.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-semibold uppercase text-slate-600 flex items-center justify-between">
                      <span>Ваш подход к решению или листинг кода:</span>
                      <span className="text-[10px] text-slate-400 font-normal">Python / C++ / Псевдокод</span>
                    </label>
                    <textarea
                      rows={6}
                      value={solutionText}
                      onChange={(e) => setSolutionText(e.target.value)}
                      placeholder="Опишите алгоритмический подход, асимптотику по времени и памяти O(...) или вставьте реализацию функции..."
                      className="w-full p-4 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 leading-relaxed bg-[#0B0F19] text-slate-100 placeholder-slate-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-[11px] text-slate-500">
                      Автоматическая оценка решения и учет в верифицированном профиле
                    </div>

                    <button
                      onClick={() => handleSubmit(selectedChallenge.id)}
                      disabled={submitting || !solutionText.trim()}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <span>{submitting ? 'Проверка алгоритма...' : 'Отправить решение'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Выберите задачу из списка слева
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
