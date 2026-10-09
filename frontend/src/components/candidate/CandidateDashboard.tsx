import React, { useState, useEffect } from 'react';
import { DemoPersona, Invitation } from '../../types';
import { api } from '../../lib/api';
import { Award, ShieldCheck, CheckCircle2, XCircle, Lock, Sparkles, Building2 } from 'lucide-react';

interface Props {
  persona: DemoPersona;
  onStartAssessment: () => void;
}

export const CandidateDashboard: React.FC<Props> = ({ persona, onStartAssessment }) => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [persona]);

  const loadData = async () => {
    setLoading(true);
    const invs = await api.getInvitations(persona.candidateId);
    setInvitations(invs);
    setLoading(false);
  };

  const handleAction = async (id: number, action: 'accept' | 'decline') => {
    const updated = await api.respondInvitation(id, action);
    setInvitations(prev => prev.map(inv => inv.id === id ? { ...inv, status: updated.status, revealed_contacts: updated.revealed_contacts } : inv));
  };

  const isIvan = persona.id === 'cand_ivan';

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* 1. Баннер подтвержденного профиля */}
      <div className="fsp-gradient text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
                Верифицированный профиль
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 152-ФЗ Защищено
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {persona.name} <span className="opacity-75 font-normal text-lg sm:text-xl">({isIvan ? 'Backend-Dev-#101' : 'Frontend-Dev-#204'})</span>
            </h1>
            <p className="text-slate-200 text-sm max-w-2xl leading-relaxed">
              {persona.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onStartAssessment}
              className="bg-white text-fsp-primary hover:bg-slate-100 font-bold px-5 py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              Пройти CAT-тест (Повысить грейд)
            </button>
          </div>
        </div>

        {/* Метрики подтверждения */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/15 text-white">
          <div>
            <div className="text-xs text-slate-300 font-medium">Подтверждённый грейд</div>
            <div className="text-xl font-black mt-0.5">{isIvan ? 'Middle Backend' : 'Junior Frontend'}</div>
            <div className="text-[11px] text-emerald-300 font-medium">CAT 2PL IRT (θ = {isIvan ? '1.15' : '-0.20'})</div>
          </div>
          <div>
            <div className="text-xs text-slate-300 font-medium">Перцентиль в категории</div>
            <div className="text-xl font-black mt-0.5">{isIvan ? 'Топ 12%' : 'Топ 42%'}</div>
            <div className="text-[11px] text-slate-300">среди 1 450 специалистов</div>
          </div>
          <div>
            <div className="text-xs text-slate-300 font-medium">Спортивное программирование</div>
            <div className="text-xl font-black mt-0.5 flex items-center gap-1">
              {isIvan ? (
                <>
                  <Award className="w-5 h-5 text-amber-300" />
                  Призёр ФСП
                </>
              ) : (
                <span className="text-slate-300 text-base font-normal">Нет истории (бонус = 0)</span>
              )}
            </div>
            <div className="text-[11px] text-slate-300">{isIvan ? 'FSP-RU-2024-1001' : 'Веса ранжирования перенормированы'}</div>
          </div>
          <div>
            <div className="text-xs text-slate-300 font-medium">Зарплатные ожидания</div>
            <div className="text-xl font-black mt-0.5">{isIvan ? '180k – 230k ₽' : '90k – 130k ₽'}</div>
            <div className="text-[11px] text-emerald-300">Условия видны работодателю</div>
          </div>
        </div>
      </div>

      {/* 2. Блок входящих персональных предложений от работодателей (Обратная механика) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-fsp-primary" />
              Входящие персональные приглашения от компаний
            </h2>
            <p className="text-sm text-slate-500">
              Работодатель сам нашёл ваш верифицированный профиль и направил предложение с гарантированной вилкой зарплаты.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl p-8 text-center border border-slate-200">
            <p className="text-slate-500">Загрузка приглашений...</p>
          </div>
        ) : invitations.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-slate-200">
            <p className="text-slate-500">Новых приглашений пока нет. Пройдите регулярное микро-задание для повышения свежести профиля!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-bold text-fsp-primary bg-fsp-lavender px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Персональный оффер
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">{inv.title}</h3>
                    <div className="text-sm font-semibold text-slate-600 flex items-center gap-1.5 mt-0.5">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      {inv.company_name}
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="text-xs text-slate-500">Обязательная вилка зарплаты (в рублях):</div>
                    <div className="text-xl font-black text-emerald-600">
                      {inv.salary_from.toLocaleString('ru-RU')} – {inv.salary_to.toLocaleString('ru-RU')} ₽
                    </div>
                    <div className="text-[11px] text-slate-400">Гарантия условий до начала диалога</div>
                  </div>
                </div>

                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {inv.message}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-slate-400" />
                    <span>
                      {inv.status === 'ACCEPTED'
                        ? '✅ Вы приняли предложение. Ваши контакты раскрыты работодателю.'
                        : '🔒 Ваши контакты скрыты от компании, пока вы не нажмете «Принять предложение».'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {inv.status === 'SENT' ? (
                      <>
                        <button
                          onClick={() => handleAction(inv.id, 'decline')}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1"
                        >
                          <XCircle className="w-4 h-4" />
                          Отклонить
                        </button>
                        <button
                          onClick={() => handleAction(inv.id, 'accept')}
                          className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Принять предложение (Раскрыть контакты)
                        </button>
                      </>
                    ) : inv.status === 'ACCEPTED' ? (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Предложение принято
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-xl">
                        Отклонено
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
