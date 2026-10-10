import React, { useState, useEffect } from 'react';
import { DemoPersona, CandidatePublicCard } from '../../types';
import { api } from '../../lib/api';
import { ExplainModal } from './ExplainModal';
import { Sparkles, Award, Search, Send, ShieldCheck, CheckCircle2, Check } from 'lucide-react';

interface Props {
  persona: DemoPersona;
}

export const EmployerDashboard: React.FC<Props> = ({ persona }) => {
  const [candidates, setCandidates] = useState<CandidatePublicCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCandidateForExplain, setSelectedCandidateForExplain] = useState<CandidatePublicCard | null>(null);
  const [inviteModalCandidate, setInviteModalCandidate] = useState<CandidatePublicCard | null>(null);

  // Форма потребности работодателя
  const [needTitle, setNeedTitle] = useState('Middle Python / FastAPI Архитектор');
  const [specSlug, setSpecSlug] = useState('backend');
  const [gradeSlug, setGradeSlug] = useState('middle');
  const [salaryFrom, setSalaryFrom] = useState(190000);
  const [salaryTo, setSalaryTo] = useState(250000);
  const [inviteMessage, setInviteMessage] = useState('Здравствуйте! Нас впечатлил ваш верифицированный профиль и результаты CAT-тестирования. Приглашаем на техническое интервью в команду сервисов.');
  const [inviteSuccess, setInviteSuccess] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, [persona]);

  const fetchCandidates = async () => {
    setLoading(true);
    const results = await api.getRecommendations({
      specialization: specSlug,
      grade: gradeSlug,
      salary_min: salaryFrom,
      salary_max: salaryTo
    });
    setCandidates(results);
    setLoading(false);
  };

  const handleSendInvite = async () => {
    if (!inviteModalCandidate) return;

    await api.sendInvitation({
      candidate_id: inviteModalCandidate.candidate_id,
      title: needTitle,
      message: inviteMessage,
      salary_from: salaryFrom,
      salary_to: salaryTo,
      contact_method: 'Telegram: @recruiter_fsp'
    });

    setInviteSuccess(true);
    setTimeout(() => {
      setInviteSuccess(false);
      setInviteModalCandidate(null);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      
      {/* 1. КОНСТРУКТОР ПОТРЕБНОСТИ РАБОТОДАТЕЛЯ (REVERSE RECRUITING CONTROL PANEL) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded uppercase">
                {persona.name}
              </span>
              <span className="text-xs text-blue-700 font-mono font-semibold bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded">
                ОБРАТНЫЙ НАЙМ: ИНИЦИАТИВА У КОМПАНИИ
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Подбор кандидатов по верифицированным категориям
            </h1>
            <p className="text-xs text-slate-500">
              Поиск соискателей с объективным подтверждением способности (CAT 2PL IRT) и олимпиадных достижений ФСП.
            </p>
          </div>

          <button
            onClick={fetchCandidates}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2 text-xs self-start sm:self-auto cursor-pointer"
          >
            <Search className="w-4 h-4" />
            Запустить алгоритм подбора
          </button>
        </div>

        {/* Поля ввода потребности с обязательной вилкой зарплаты */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono uppercase text-slate-500 block mb-1.5 font-semibold">
              Позиция / открытая вакансия
            </label>
            <input
              type="text"
              value={needTitle}
              onChange={(e) => setNeedTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="Например: Middle Python / FastAPI Архитектор"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-mono uppercase text-slate-500 block mb-1.5 font-semibold">
                Специализация
              </label>
              <select
                value={specSlug}
                onChange={(e) => setSpecSlug(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="backend">Backend-разработка</option>
                <option value="frontend">Frontend-разработка</option>
                <option value="data_ml">Data Science / ML</option>
                <option value="devops">DevOps / Инфраструктура</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-slate-500 block mb-1.5 font-semibold">
                Целевой грейд
              </label>
              <select
                value={gradeSlug}
                onChange={(e) => setGradeSlug(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="junior">Junior (Младший)</option>
                <option value="middle">Middle (Специалист)</option>
                <option value="senior">Senior (Старший)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-slate-500 block mb-1.5 font-semibold">
                Бюджет от (₽, обязательно)
              </label>
              <input
                type="number"
                value={salaryFrom}
                onChange={(e) => setSalaryFrom(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-slate-500 block mb-1.5 font-semibold">
                Бюджет до (₽, обязательно)
              </label>
              <input
                type="number"
                value={salaryTo}
                onChange={(e) => setSalaryTo(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. СПИСОК РАНЖИРОВАННЫХ КАНДИДАТОВ */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Рекомендованные кандидаты ({candidates.length})
            </h2>
            <span className="text-[11px] font-mono text-slate-400">
              [Ранжирование Reverse Matching]
            </span>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Контакты соискателя скрыты до принятия оффера (152-ФЗ)</span>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 font-mono text-xs">
            Подбор и ранжирование кандидатов по математической формуле...
          </div>
        ) : candidates.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 space-y-2">
            <p className="font-semibold text-sm">Подходящих кандидатов не найдено.</p>
            <p className="text-xs text-slate-400">Попробуйте расширить зарплатную вилку или изменить целевой грейд.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {candidates.map((cand) => {
              const matchPercent = Math.round((cand.match_score || 0.85) * 100);
              const candMin = cand.preferred_salary_from || 180000;
              const candMax = cand.preferred_salary_to || 230000;
              const isSalaryFit = candMin <= salaryTo && candMax >= salaryFrom;

              return (
                <div
                  key={cand.candidate_id}
                  className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm hover:shadow-md transition-all space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-lg font-black text-slate-900 tracking-tight">
                          {cand.pseudonym}
                        </span>
                        <span className="bg-slate-100 text-slate-800 text-xs font-mono font-semibold px-2.5 py-0.5 rounded border border-slate-200">
                          {cand.specialization_name} • {cand.grade_name}
                        </span>
                        {cand.has_fsp && (
                          <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold px-2.5 py-0.5 rounded-md flex items-center gap-1 font-mono">
                            <Award className="w-3.5 h-3.5 text-amber-600" /> {cand.fsp_summary}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        Опыт: {cand.years_of_experience} г. • {cand.city} • Рейтинг в категории: топ-{Math.round(100 - cand.percentile)}% (тест сдан)
                      </div>
                    </div>

                    <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-2xl border sm:border-0 border-slate-100">
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Матч потребности:</div>
                      <div className="text-3xl font-black text-blue-600 font-mono tracking-tight">
                        {matchPercent}%
                      </div>
                      <div className="text-xs text-slate-700 font-mono">
                        Ожидания: {candMin.toLocaleString('ru-RU')} - {candMax.toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                  </div>

                  {/* Индикатор зарплатного совпадения (Salary Overlap Gauge) */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <span className="font-mono text-[10px] uppercase text-slate-400 font-bold block">
                        Совпадение зарплатной вилки:
                      </span>
                      <span className="text-slate-800 font-medium">
                        Кандидат: <strong className="font-mono">{candMin / 1000}k - {candMax / 1000}k ₽</strong> | Ваша вакансия: <strong className="font-mono">{salaryFrom / 1000}k - {salaryTo / 1000}k ₽</strong>
                      </span>
                    </div>
                    <div>
                      {isSalaryFit ? (
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md font-mono text-xs font-bold inline-flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" /> ПОЛНОЕ ПЕРЕСЕЧЕНИЕ
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-md font-mono text-xs font-semibold">
                          ЧАСТИЧНОЕ СОВПАДЕНИЕ
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Подтвержденные навыки */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-mono uppercase text-slate-400">Верифицированный стек:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {cand.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="bg-slate-100 text-slate-800 text-xs font-mono font-medium px-2.5 py-1 rounded-md border border-slate-200/80"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Действия: Объяснить и Направить оффер */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
                    <div className="text-xs text-slate-500 max-w-xl font-medium">
                      {cand.match_explanation?.headline}
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        onClick={() => setSelectedCandidateForExplain(cand)}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        Почему в топе? (Explainable AI)
                      </button>

                      <button
                        onClick={() => setInviteModalCandidate(cand)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Пригласить кандидата
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Модальное окно Explainable AI */}
      <ExplainModal
        candidate={selectedCandidateForExplain}
        onClose={() => setSelectedCandidateForExplain(null)}
        onSendInvite={(c) => setInviteModalCandidate(c)}
      />

      {/* Модальное окно отправки приглашения соискателю */}
      {inviteModalCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 border border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-bold uppercase">
                  НАПРАВЛЕНИЕ ОФФЕРА
                </span>
                <span className="text-xs font-mono text-slate-500">
                  {inviteModalCandidate.pseudonym}
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Пригласить на позицию: {needTitle}
              </h3>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-xs font-mono">
              <div className="text-slate-500">Обязательная зарплатная вилка:</div>
              <div className="text-lg font-black text-emerald-600">
                {salaryFrom.toLocaleString('ru-RU')} - {salaryTo.toLocaleString('ru-RU')} ₽
              </div>
              <div className="text-[10px] text-slate-400">
                Гарантируется статьей 152-ФЗ и правилами платформы ФСП
              </div>
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-slate-500 block mb-1 font-semibold">
                Персональное сообщение кандидату
              </label>
              <textarea
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                onClick={() => setInviteModalCandidate(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                Отмена
              </button>
              <button
                onClick={handleSendInvite}
                disabled={inviteSuccess}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm flex items-center gap-1.5 cursor-pointer disabled:bg-emerald-600"
              >
                {inviteSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    Оффер отправлен!
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Отправить приглашение
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
