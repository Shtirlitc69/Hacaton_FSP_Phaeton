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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Логотип ФСП */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl fsp-gradient flex items-center justify-center text-white font-black text-xl shadow-md shadow-fsp-primary/20">
            ФСП
          </div>
          <div>
            <div className="font-extrabold text-slate-900 leading-tight flex items-center gap-2">
              <span>Карьера ФСП</span>
              <span className="text-[10px] bg-fsp-lavender text-fsp-primary font-bold px-2 py-0.5 rounded-full border border-fsp-primary/20">
                Хакатон 2026
              </span>
            </div>
            <p className="text-xs text-slate-500">Платформа с верифицированным профилем соревнований</p>
          </div>
        </div>

        {/* Навигация */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {currentPersona.role === 'candidate' ? (
            <>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'dashboard'
                    ? 'bg-fsp-lavender text-fsp-primary'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Award className="w-4 h-4" />
                Мой профиль
              </button>
              <button
                onClick={() => setActiveTab('assessment')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'assessment'
                    ? 'bg-fsp-lavender text-fsp-primary'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="w-4 h-4 text-fsp-primary" />
                CAT-тестирование
              </button>
              <button
                onClick={() => setActiveTab('invitations')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'invitations'
                    ? 'bg-fsp-lavender text-fsp-primary'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                Офферы компании
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'dashboard'
                    ? 'bg-fsp-lavender text-fsp-primary'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                Поиск кандидатов
              </button>
              <button
                onClick={() => setActiveTab('invitations')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'invitations'
                    ? 'bg-fsp-lavender text-fsp-primary'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Направленные приглашения
              </button>
            </>
          )}
        </nav>

        {/* Текущий статус пользователя */}
        <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-slate-200">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-800">{currentPersona.name}</div>
            <div className="text-[11px] text-slate-500">{currentPersona.badge}</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs">
            {currentPersona.name.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
};
