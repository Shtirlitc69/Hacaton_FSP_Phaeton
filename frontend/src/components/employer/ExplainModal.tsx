import React from 'react';
import { CandidatePublicCard } from '../../types';
import { X, Sparkles, ShieldCheck, Briefcase, Calculator } from 'lucide-react';

interface Props {
  candidate: CandidatePublicCard | null;
  onClose: () => void;
  onSendInvite: (cand: CandidatePublicCard) => void;
}

export const ExplainModal: React.FC<Props> = ({ candidate, onClose, onSendInvite }) => {
  if (!candidate || !candidate.match_explanation) return null;

  const { headline, factors } = candidate.match_explanation;
  const matchPercent = Math.round((candidate.match_score || 0.85) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Заголовок с бейджем Explainable AI */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-blue-50 text-blue-700 text-[11px] font-mono font-bold px-2.5 py-1 rounded border border-blue-200 flex items-center gap-1.5 uppercase">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Explainable AI: Аудит выдачи
            </span>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              Соответствие: {matchPercent}%
            </span>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {candidate.pseudonym}: Декомпозиция скоринга
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Формула обратного подбора ФСП: Score = Σ (w_i × s_i)
            </p>
          </div>

          <div className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100 font-medium leading-relaxed">
            <div className="text-[10px] font-mono text-slate-400 uppercase mb-1">Сводный вывод модели:</div>
            {headline}
          </div>
        </div>

        {/* Факторы подбора */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase">
            <span className="flex items-center gap-1">
              <Calculator className="w-3.5 h-3.5" /> Факторы и вклад в интегральный балл
            </span>
            <span>Дельта балла</span>
          </div>

          <div className="space-y-2.5">
            {factors.map((factor, idx) => {
              const contribution = ((factor.weight_percent * factor.score_percent) / 100).toFixed(1);
              return (
                <div key={idx} className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">
                      {factor.name}
                      <span className="font-mono text-slate-500 font-normal ml-2">
                        [вес: {factor.weight_percent}%]
                      </span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-slate-600">
                        совпадение {factor.score_percent}%
                      </span>
                      <span className="font-mono text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/50">
                        +{contribution}%
                      </span>
                    </div>
                  </div>

                  {/* Тонкий прогресс-бар без громоздкого трека */}
                  <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${factor.score_percent}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-600 leading-normal">
                    {factor.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Раздел 152-ФЗ */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-700 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-bold text-slate-900 font-mono text-xs">ЗАЩИТА КОНТАКТОВ ПО 152-ФЗ</div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Контакты соискателя (ФИО, телефон, email, Telegram) будут переданы вашей компании только после того, как кандидат примет персональное приглашение с вашей вилкой зарплаты.
            </p>
          </div>
        </div>

        {/* Действия */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Закрыть
          </button>
          <button
            onClick={() => {
              onClose();
              onSendInvite(candidate);
            }}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Briefcase className="w-4 h-4" />
            Направить оффер кандидату
          </button>
        </div>
      </div>
    </div>
  );
};
