import React, { useState, useEffect } from 'react';
import { DemoPersona, CandidatePublicCard } from '../../types';
import { api } from '../../lib/api';
import { ExplainModal } from './ExplainModal';
import { Briefcase, Sparkles, Award, DollarSign, Filter, Search, Send, ShieldCheck, CheckCircle2 } from 'lucide-react';

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
  const [inviteMessage, setInviteMessage] = useState('Здравствуйте! Нас впечатлил ваш подтверждённый профиль и результаты CAT-тестирования. Приглашаем на интервью в продуктовую команду.');
  const [inviteSuccess, setInviteSuccess] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, [persona]);

  const fetchCandidates = async () => {
    setLoading(true);
    const results = await api.getRecommendations({
      title: needTitle,
      specialization_slug: specSlug,
      target_grade_slug: gradeSlug,
      salary_from: salaryFrom,
      salary_to: salaryTo,
      required_skills: ['Python', 'FastAPI', 'PostgreSQL', 'Redis'],
      description: 'Асинхронные микросервисы и интеграции'
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
      contact_method: 'Telegram: @recruiter_sber'
    });

    setInviteSuccess(true);
    setTimeout(() => {
      setInviteSuccess(false);
      setInviteModalCandidate(null);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* 1. Конструктор потребности (Employer Need Builder) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <span className="text-xs font-bold text-fsp-primary bg-fsp-lavender px-3 py-1 rounded-full uppercase tracking-wider">
              {persona.name}
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-1">Подбор специалистов по верифицированным категориям</h1>
            <p className="text-sm text-slate-500">
              Система ранжирует кандидатов по объективным результатам CAT-теста и достижениям ФСП.
            </p>
          </div>

          <button
            onClick={fetchCandidates}
            className="bg-fsp-primary hover:bg-fsp-light text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-fsp-primary/20 transition-all flex items-center gap-2 text-sm self-start sm:self-auto"
          >
            <Search className="w-4 h-4" />
            Обновить подборку
          </button>
        </div>

        {/* Поля ввода потребности с обязательной вилкой зарплаты */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Специализация</label>
            <select
              value={specSlug}
              onChange={(e) => setSpecSlug(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800"
            >
              <option value="backend">Backend-разработка</option>
              <option value="frontend">Frontend-разработка</option>
              <option value="data_ml">Data Science / ML</option>
              <option value="devops">DevOps / Инфраструктура</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Целевой грейд</label>
            <select
              value={gradeSlug}
              onChange={(e) => setGradeSlug(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800"
            >
              <option value="junior">Junior</option>
              <option value="middle">Middle</option>
              <option value="senior">Senior</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Зарплата от (₽, обязательно)
            </label>
            <input
              type="number"
              value={salaryFrom}
              onChange={(e) => setSalaryFrom(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Зарплата до (₽, обязательно)
            </label>
            <input
              type="number"
              value={salaryTo}
              onChange={(e) => setSalaryTo(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* 2. Список ранжированных обезличенных кандидатов */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-fsp-primary" />
            Рекомендованные кандидаты ({candidates.length})
          </h2>
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Контакты скрыты до акцепта приглашения
          </span>
        </div>

        <div className="grid gap-4">
          {candidates.map((cand) => (
            <div
              key={cand.candidate_id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-slate-900">{cand.pseudonym}</span>
                    <span className="bg-fsp-lavender text-fsp-primary text-xs font-bold px-3 py-0.5 rounded-full">
                      {cand.specialization_name} • {cand.grade_name}
                    </span>
                    {cand.has_fsp && (
                      <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" /> {cand.fsp_summary}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    Опыт: {cand.years_of_experience} г. • {cand.city} • Рейтинг в категории: топ-{Math.round(100 - cand.percentile)}%
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-xs text-slate-400">Совпадение с потребностью:</div>
                  <div className="text-2xl font-black text-fsp-primary">
                    {Math.round((cand.match_score || 0.85) * 100)}%
                  </div>
                  <div className="text-xs text-emerald-600 font-bold">
                    Ожидания: {cand.preferred_salary_from?.toLocaleString('ru-RU')} – {cand.preferred_salary_to?.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              </div>

              {/* Навыки */}
              <div className="flex flex-wrap gap-1.5">
                {cand.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-lg"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Действия: Объяснить и Направить приглашение */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-500 italic max-w-xl">
                  {cand.match_explanation?.headline}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedCandidateForExplain(cand)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-fsp-primary bg-fsp-lavender hover:bg-fsp-lavender/70 transition-colors flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Почему в топе? (Explainable AI)
                  </button>

                  <button
                    onClick={() => setInviteModalCandidate(cand)}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-fsp-primary hover:bg-fsp-light text-white shadow-md shadow-fsp-primary/20 transition-all flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Пригласить кандидата
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Модальное окно Explainable AI */}
      <ExplainModal
        candidate={selectedCandidateForExplain}
        onClose={() => setSelectedCandidateForExplain(null)}
        onSendInvite={(c) => setInviteModalCandidate(c)}
      />

      {/* Модальное окно отправки приглашения соискателю */}
      {inviteModalCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <h3 className="text-xl font-black text-slate-900">
              Направить предложение: {inviteModalCandidate.pseudonym}
            </h3>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
              <div className="text-xs text-slate-500 font-bold">Обязательная вилка зарплаты в оффере:</div>
              <div className="text-lg font-black text-emerald-600">
                {salaryFrom.toLocaleString('ru-RU')} – {salaryTo.toLocaleString('ru-RU')} ₽
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Текст предложения:</label>
              <textarea
                rows={4}
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm font-medium text-slate-800"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setInviteModalCandidate(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                Отмена
              </button>
              <button
                onClick={handleSendInvite}
                disabled={inviteSuccess}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-fsp-primary hover:bg-fsp-light text-white shadow-lg shadow-fsp-primary/20 flex items-center gap-1.5"
              >
                {inviteSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    Приглашение отправлено!
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
