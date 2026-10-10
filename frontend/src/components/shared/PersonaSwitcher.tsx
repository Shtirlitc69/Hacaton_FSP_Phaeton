import React from 'react';
import { DemoPersona } from '../../types';
import { UserCheck, Building2, Award } from 'lucide-react';

interface Props {
  currentPersona: DemoPersona;
  onSelectPersona: (p: DemoPersona) => void;
}

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: 'cand_ivan',
    name: 'Иван Смирнов',
    role: 'candidate',
    description: 'Middle Backend (Python/FastAPI) • Серебряный призёр ФСП',
    candidateId: 1,
    badge: 'Призёр ФСП'
  },
  {
    id: 'cand_anna',
    name: 'Анна Васильева',
    role: 'candidate',
    description: 'Junior Frontend (React/TS) • Без спортивной истории',
    candidateId: 2,
    badge: 'Без ФСП'
  },
  {
    id: 'emp_sber',
    name: 'СберТех (HR)',
    role: 'employer',
    description: 'Работодатель • Поиск Middle/Senior разработчиков',
    employerId: 1,
    badge: 'Компания'
  },
  {
    id: 'emp_yandex',
    name: 'Яндекс (HR)',
    role: 'employer',
    description: 'Работодатель • Поиск HighLoad инженеров',
    employerId: 2,
    badge: 'Компания'
  }
];

export const PersonaSwitcher: React.FC<Props> = ({ currentPersona, onSelectPersona }) => {
  return (
    <div className="bg-slate-950 text-white px-4 py-2 border-b border-slate-800/80 text-xs font-sans">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="bg-blue-600 text-white font-mono px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">
            ДЕМО ДЛЯ ЖЮРИ
          </span>
          <span className="text-slate-400 text-xs">Переключение ролей в 1 клик:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {DEMO_PERSONAS.map((p) => {
            const isActive = p.id === currentPersona.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPersona(p)}
                className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all text-xs font-medium border ${
                  isActive
                    ? 'bg-blue-600 border-blue-500 text-white shadow-sm ring-1 ring-blue-400/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                {p.role === 'candidate' ? (
                  p.badge.includes('Призёр') ? (
                    <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  ) : (
                    <UserCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  )
                ) : (
                  <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                )}
                <span>{p.name}</span>
                <span className="text-slate-400 text-[10px] font-mono">
                  [{p.role === 'candidate' ? 'Соискатель' : 'Работодатель'}]
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
