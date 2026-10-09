import React from 'react';
import { CandidatePublicCard } from '../../types';
import { X, Sparkles, ShieldCheck, Briefcase } from 'lucide-react';

interface Props {
  candidate: CandidatePublicCard | null;
  onClose: () => void;
  onSendInvite: (cand: CandidatePublicCard) => void;
}

export const ExplainModal: React.FC<Props> = ({ candidate, onClose, onSendInvite }) => {
  if (!candidate || !candidate.match_explanation) return null;

  const { headline, factors } = candidate.match_explanation;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Заголовок с бейджем Explainable AI */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-fsp-lavender text-fsp-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Explainable AI (Обоснование выдачи)
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Совпадение: {Math.round((candidate.match_score || 0.85) * 100)}%
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {candidate.pseudonym} — Декомпозиция скоринга
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium leading-relaxed">
            {headline}
          </p>
        </div>

        {/* Факторы подбора */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Вклад факторов в интегральный балл:
          </h3>

          <div className="space-y-3">
            {factors.map((factor, idx) => (
              <div key={idx} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800">{factor.name} (вес {factor.weight_percent}%)</span>
                  <span className="text-fsp-primary font-black">{factor.score_percent}% совпадения</span>
                </div>

                {/* Прогресс-бар */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-fsp-primary h-full rounded-full transition-all duration-500"
                    style={{ width: `${factor.score_percent}%` }}
                  />
                </div>

                <p className="text-xs text-slate-600 pt-1">
                  {factor.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Раздел 152-ФЗ */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Защита контактов по 152-ФЗ</div>
            <p className="mt-0.5 text-amber-700 leading-relaxed">
              Контакты соискателя (ФИО, телефон, email, TG) станут доступны после того, как он подтвердит ваше приглашение с обязательной вилкой зарплаты.
            </p>
          </div>
        </div>

        {/* Кнопка отправки оффера */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Закрыть
          </button>
          <button
            onClick={() => {
              onClose();
              onSendInvite(candidate);
            }}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-fsp-primary hover:bg-fsp-light text-white shadow-lg shadow-fsp-primary/20 transition-all flex items-center gap-1.5"
          >
            <Briefcase className="w-4 h-4" />
            Направить приглашение кандидату
          </button>
        </div>
      </div>
    </div>
  );
};
