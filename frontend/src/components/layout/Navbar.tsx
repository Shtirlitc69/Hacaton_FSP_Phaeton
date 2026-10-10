import React from 'react';
import { DemoPersona, AuthSession } from '../../types';
import { Award, Briefcase, Sparkles, Send, PlusCircle, LogIn, LogOut, CheckCircle2 } from 'lucide-react';

export type AppTab = 'dashboard' | 'assessment' | 'invitations' | 'challenges' | 'vacancies' | 'create_vacancy';

interface Props {
  currentPersona: DemoPersona;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  session: AuthSession | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<Props> = ({
  currentPersona,
  activeTab,
  setActiveTab,
  session,
  onOpenAuth,
  onLogout
}) => {
  const isCandidate = currentPersona.role === 'candidate';

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 backdrop-blur-md bg-white/95 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Логотип ФСП */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white font-black text-sm tracking-tight shadow-sm">
            ФСП
          </div>
          <div className="hidden sm:block">
            <div className="font-extrabold text-slate-900 leading-tight flex items-center gap-2">
              <span className="tracking-tight text-base font-black">Карьера ФСП</span>
              <span className="text-[10px] bg-slate-100 text-slate-700 font-mono font-bold px-2 py-0.5 rounded border border-slate-200">
                2026
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Верифицированная платформа ИТ-найма</p>
          </div>
        </div>

        {/* Навигационные вкладки */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          {isCandidate ? (
            <>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'dashboard'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Профиль</span>
              </button>

              <button
                onClick={() => setActiveTab('assessment')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'assessment'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span>CAT-тест</span>
              </button>

              <button
                onClick={() => setActiveTab('invitations')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'invitations'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Офферы</span>
              </button>

              <button
                onClick={() => setActiveTab('challenges')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'challenges'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Задания дня</span>
              </button>

              <button
                onClick={() => setActiveTab('vacancies')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'vacancies'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Вакансии</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'dashboard'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Подбор кандидатов</span>
              </button>

              <button
                onClick={() => setActiveTab('invitations')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'invitations'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Send className="w-3.5 h-3.5 text-blue-500" />
                <span>Отправленные офферы</span>
              </button>

              <button
                onClick={() => setActiveTab('create_vacancy')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'create_vacancy'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>Опубликовать вакансию</span>
              </button>
            </>
          )}
        </nav>

        {/* Правый блок: Профиль / Вход */}
        <div className="flex items-center gap-2.5 shrink-0 pl-2 border-l border-slate-200">
          {session ? (
            <div className="flex items-center gap-2">
              <div className="hidden md:block text-right">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {session.nameOrTitle || session.email}
                </div>
                <div className="text-[10px] text-emerald-600 font-mono font-semibold flex items-center justify-end gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>152-ФЗ ВЕРИФИЦИРОВАН</span>
                </div>
              </div>

              <button
                onClick={onLogout}
                title="Выйти из аккаунта"
                className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="hidden md:block text-right">
                <div className="text-xs font-bold text-slate-900 leading-tight">{currentPersona.name}</div>
                <div className="text-[10px] text-slate-500 font-mono">{currentPersona.badge}</div>
              </div>

              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Войти / Регистрация</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
