import React from 'react';
import { DemoPersona } from '../../types';
import { ShieldCheck, Award, Briefcase, Sparkles } from 'lucide-react';

interface Props {
  currentPersona: DemoPersona;
  activeTab: 'dashboard' | 'assessment' | 'invitations';
  setActiveTab: (tab: 'dashboard' | 'assessment' | 'invitations') => void;
}

export const Navbar: React.FC<Props> = ({ currentPersona, activeTab, setActiveTab }) => {
  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Логотип ФСП */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white font-black text-sm tracking-tight shadow-sm">
            ФСП
          </div>
          <div>
            <div className="font-extrabold text-slate-900 leading-tight flex items-center gap-2">
              <span className="tracking-tight text-base font-black">Карьера ФСП</span>
              <span className="text-[10px] bg-slate-100 text-slate-700 font-mono font-bold px-2 py-0.5 rounded border border-slate-200">
                2026
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Верифицированные достижения спортивного программирования</p>
          </div>
        </div>

        {/* Навигация */}
        <nav className="flex items-center gap-1 sm:gap-1.5">
          {currentPersona.role === 'candidate' ? (
            <>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'dashboard'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                Мой профиль
              </button>
              <button
                onClick={() => setActiveTab('assessment')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'assessment'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                CAT-тестирование
              </button>
              <button
                onClick={() => setActiveTab('invitations')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'invitations'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                Входящие офферы
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'dashboard'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                Подбор кандидатов
              </button>
              <button
                onClick={() => setActiveTab('invitations')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'invitations'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Отправленные офферы
              </button>
            </>
          )}
        </nav>

        {/* Текущий статус пользователя */}
        <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-slate-200">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-900">{currentPersona.name}</div>
            <div className="text-[11px] text-slate-500 font-mono">{currentPersona.badge}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
            {currentPersona.name.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
};
