import React, { useState, useEffect } from 'react';
import { DemoPersona, Invitation } from '../../types';
import { api } from '../../lib/api';
import { ShieldCheck, CheckCircle2, XCircle, Lock, Sparkles, Building2 } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      
      {/* 1. АСИММЕТРИЧНЫЙ BENTO GRID ПРОФИЛЯ КАНДИДАТА */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Карточка 1: Главный фокус-блок соискателя (8 колонок) */}
        <div className="md:col-span-12 lg:col-span-8 bg-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800/80 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> 152-ФЗ ЗАЩИТА АКТИВНА
              </span>
              <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold">
                ID: {isIvan ? 'Backend-Dev-#101' : 'Frontend-Dev-#204'}
              </span>
              <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md text-[11px] font-mono">
                {isIvan ? 'г. Москва' : 'г. Санкт-Петербург'}
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {persona.name}
              </h1>
              <p className="text-slate-300 text-sm mt-1 max-w-xl leading-relaxed">
                {persona.description}
              </p>
            </div>

            {/* Подтвержденный технологический стек */}
            <div className="pt-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">
                Подтвержденный стек (верифицирован CAT-тестом):
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(isIvan ? ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'AsyncIO', 'Redis'] : ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'HTML5/CSS3']).map(tech => (
                  <span key={tech} className="bg-slate-900 border border-slate-800 text-slate-200 text-xs px-2.5 py-1 rounded-md font-mono">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 mt-6 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Профиль открыт для персональных офферов компаний</span>
            </div>

            <button
              onClick={onStartAssessment}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-xs self-start sm:self-auto cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Пройти CAT-тест (Повысить грейд)
            </button>
          </div>
        </div>

        {/* Карточка 2: Психометрическая способность CAT 2PL IRT (4 колонки) */}
        <div className="md:col-span-6 lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-2">
              <span>ПСИХОМЕТРИЯ (2PL IRT)</span>
              <span className="text-blue-600 font-bold">EAP-оценка</span>
            </div>
            
            <div className="mt-1">
              <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                θ = {isIvan ? '+1.15' : '-0.20'}
              </div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">
                SE(θ) = {isIvan ? '0.22' : '0.28'} [высокая надежность]
              </div>
            </div>

            {/* Визуальная шкала нормализованной способности */}
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>Junior (-2.0)</span>
                <span>Middle (0.0)</span>
                <span>Senior (+2.0)</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-700"
                  style={{ width: isIvan ? '72%' : '44%' }}
                />
              </div>
            </div>

            <div className="mt-5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <div className="text-xs font-bold text-slate-800">
                Грейд: {isIvan ? 'Специалист (Middle Backend)' : 'Младший разработчик (Junior Frontend)'}
              </div>
              <div className="text-xs text-blue-700 font-mono font-semibold">
                {isIvan ? 'Топ 12% в категории (1 450 инженеров)' : 'Топ 42% в категории'}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100 font-mono">
            Адаптивный алгоритм остановил тест по порогу SE ≤ 0.35
          </div>
        </div>

        {/* Карточка 3: Достижения в Спортивном Программировании (ФСП) (6 колонок) */}
        <div className="md:col-span-6 lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-2">
              <span>РЕЕСТР ДОСТИЖЕНИЙ ФСП</span>
              <span className={`font-bold ${isIvan ? 'text-amber-600' : 'text-slate-400'}`}>
                {isIvan ? 'ВЕРИФИЦИРОВАНО' : 'НЕТ ИСТОРИИ'}
              </span>
            </div>

            {isIvan ? (
              <div className="space-y-3 mt-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl shadow-sm">
                    🥈
                  </div>
                  <div>
                    <div className="text-base font-extrabold text-slate-900">
                      Серебряный призёр Чемпионата России 2024
                    </div>
                    <div className="text-xs text-slate-500">
                      Федерация спортивного программирования РФ
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 text-xs font-mono text-amber-900 flex items-center justify-between">
                  <span>Сертификат: FSP-RU-2024-1001</span>
                  <span className="font-bold text-amber-700">+15% бонус в подборе</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 mt-2">
                <div className="flex items-center gap-3 text-slate-400">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-xl">
                    ⚡
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-700">
                      Спортивный профиль не привязан
                    </div>
                    <div className="text-xs text-slate-500">
                      Кандидат не участвовал в турнирах ФСП
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                  Алгоритм подбора автоматически перенормировал веса без штрафа для соискателя.
                </div>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100 font-mono">
            Проверка по публичному реестру соревнований ФСП
          </div>
        </div>

        {/* Карточка 4: Зарплатные ожидания и гарантия условий (6 колонок) */}
        <div className="md:col-span-12 lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-2">
              <span>ЗАРПЛАТНЫЕ ОЖИДАНИЯ</span>
              <span className="text-emerald-600 font-bold">ОБЯЗАТЕЛЬНО ДЛЯ HR</span>
            </div>

            <div className="mt-2">
              <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                {isIvan ? '180 000 - 230 000 ₽' : '90 000 - 130 000 ₽'}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Чистыми на руки (Net), фиксированная вилка
              </div>
            </div>

            <div className="mt-4 p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-xs text-emerald-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Гарантия условий до начала диалога
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Работодатель обязан зафиксировать вилку не ниже ваших ожиданий при отправке приглашения.
              </p>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100 font-mono">
            Защита от занижения зарплаты на этапе скрининга
          </div>
        </div>

      </div>

      {/* 2. БЛОК ВХОДЯЩИХ ПЕРСОНАЛЬНЫХ ПРИГЛАШЕНИЙ (REVERSE RECRUITING) */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Входящие персональные приглашения от компаний ({invitations.length})
            </h2>
            <p className="text-xs text-slate-500">
              Работодатели нашли ваш подтвержденный профиль и направили оффер с гарантированной вилкой.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 font-mono text-xs">
            Загрузка входящих офферов...
          </div>
        ) : invitations.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2">
            <p className="text-slate-600 font-medium text-sm">Новых приглашений пока нет.</p>
            <p className="text-xs text-slate-400">Пройдите регулярное микро-задание для повышения свежести профиля в поисковой выдаче.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm hover:shadow-md transition-all space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 rounded uppercase">
                        ПЕРСОНАЛЬНЫЙ ОФФЕР
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        ID приглашения: #{inv.id}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{inv.title}</h3>
                    <div className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      {inv.company_name}
                    </div>
                  </div>

                  <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-4 sm:p-0 rounded-2xl border sm:border-0 border-slate-100">
                    <div className="text-[11px] font-mono uppercase text-slate-500">Гарантированная вилка:</div>
                    <div className="text-2xl font-black text-emerald-600 font-mono tracking-tight mt-0.5">
                      {inv.salary_from.toLocaleString('ru-RU')} - {inv.salary_to.toLocaleString('ru-RU')} ₽
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">Фиксация бюджета по правилам ФСП</div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm text-slate-700 leading-relaxed">
                  <div className="text-[11px] font-mono text-slate-400 uppercase mb-1">Сообщение от руководителя команды:</div>
                  "{inv.message}"
                </div>

                {/* Раскрытые контакты при согласии */}
                {inv.status === 'ACCEPTED' && inv.revealed_contacts && (
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs space-y-2">
                    <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Контакты успешно раскрыты работодателю (Зафиксировано в аудит-логе 152-ФЗ):
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-emerald-950 pt-1">
                      <div>ФИО: {inv.revealed_contacts.first_name} {inv.revealed_contacts.last_name}</div>
                      <div>Телефон: {inv.revealed_contacts.phone}</div>
                      <div>Email: {inv.revealed_contacts.email}</div>
                      <div>Telegram: {inv.revealed_contacts.telegram}</div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      {inv.status === 'ACCEPTED'
                        ? 'Вы приняли приглашение. Работодатель получил доступ к вашим прямым контактам.'
                        : 'Ваши контакты защищены. До акцепта компания видит только подтвержденный стек и результаты теста.'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {inv.status === 'SENT' ? (
                      <>
                        <button
                          onClick={() => handleAction(inv.id, 'decline')}
                          className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                          Отклонить
                        </button>
                        <button
                          onClick={() => handleAction(inv.id, 'accept')}
                          className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Принять оффер (Раскрыть контакты)
                        </button>
                      </>
                    ) : inv.status === 'ACCEPTED' ? (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> ОФФЕР ПРИНЯТ
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-xl font-mono">
                        ОТКЛОНЕНО
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
