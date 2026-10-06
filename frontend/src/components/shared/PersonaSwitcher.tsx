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
    badge: '🏆 Призёр ФСП'
  },
  {
    id: 'cand_anna',
    name: 'Анна Васильева',
    role: 'candidate',
    description: 'Junior Frontend (React/TS) • Без спортивной истории',
    candidateId: 2,
    badge: '⚡ Без ФСП'
  },
  {
    id: 'emp_sber',
    name: 'СберТех (HR)',
    role: 'employer',
    description: 'Работодатель • Поиск Middle/Senior разработчиков',
    employerId: 1,
    badge: '🏢 Компания'
  },
  {
    id: 'emp_yandex',
    name: 'Яндекс (HR)',
    role: 'employer',
    description: 'Работодатель • Поиск HighLoad инженеров',
    employerId: 2,
    badge: '🏢 Компания'
  }
];

export const PersonaSwitcher: React.FC<Props> = ({ currentPersona, onSelectPersona }) => {
  return (
    <div className="bg-slate-900 text-white px-4 py-2 border-b border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="bg-fsp-primary px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">
            Демо для жюри
          </span>
          <span className="text-slate-300">Переключение ролей в 1 клик:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {DEMO_PERSONAS.map((p) => {
            const isActive = p.id === currentPersona.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPersona(p)}
                className={`px-3 py-1 rounded-full flex items-center gap-1.5 transition-all font-medium ${
                  isActive
                    ? 'bg-fsp-primary text-white shadow-md shadow-fsp-primary/40 ring-1 ring-white/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {p.role === 'candidate' ? (
                  p.badge.includes('Призёр') ? <Award className="w-3.5 h-3.5 text-amber-400" /> : <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>{p.name}</span>
                <span className="opacity-70 text-[10px]">({p.role === 'candidate' ? 'Соискатель' : 'Работодатель'})</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
