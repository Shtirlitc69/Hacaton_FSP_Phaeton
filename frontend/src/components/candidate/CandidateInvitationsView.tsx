import React, { useState } from 'react';
import { Invitation } from '../../types';
import { api } from '../../lib/api';
import { Briefcase, Building2, ShieldCheck, CheckCircle2, XCircle, Clock, ExternalLink } from 'lucide-react';

interface Props {
  invitations: Invitation[];
  onRefresh: () => void;
  onToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

export const CandidateInvitationsView: React.FC<Props> = ({ invitations, onRefresh, onToast }) => {
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleAction = async (id: number, action: 'accept' | 'decline') => {
    setLoadingId(id);
    try {
      await api.respondInvitation(id, action);
      if (action === 'accept') {
        onToast(
          'Предложение принято!',
          'Ваши прямые контакты переданы работодателю в соответствии с 152-ФЗ. Ожидайте выхода на связь!',
          'success'
        );
      } else {
        onToast('Предложение отклонено', 'Работодатель уведомлен об отклонении предложения.', 'info');
      }
      onRefresh();
    } catch (e) {
      onToast('Ошибка', 'Не удалось обработать действие по офферу', 'error');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8 space-y-6 animate-fade-in">
      {/* Шапка раздела */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-blue-600 font-bold">
            <Briefcase className="w-4 h-4" />
            <span>Входящие офферы • Reverse Recruiting</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
            Персональные предложения от компаний ({invitations.length})
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Компании сами выходят на вас с фиксированной зарплатной вилкой. Ваши контакты закрыты до подтверждения.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl text-emerald-700 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Гарантия 152-ФЗ: без спама и холодных звонков</span>
        </div>
      </div>

      {/* Список офферов */}
      {invitations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Пока нет входящих предложений</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Пройдите адаптивный тест CAT и укажите желаемую зарплатную вилку в профиле, чтобы работодатели могли направлять вам прямые офферы.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {invitations.map((inv) => {
            const isPending = inv.status === 'SENT' || inv.status === 'VIEWED';
            const isAccepted = inv.status === 'ACCEPTED';
            const isDeclined = inv.status === 'DECLINED';

            return (
              <div
                key={inv.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-sm transition-all hover:border-slate-300 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                      <Building2 className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-base">{inv.company_name}</span>
                        {inv.company_website && (
                          <a
                            href={inv.company_website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-400 hover:text-blue-600 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-slate-700">{inv.title}</div>
                    </div>
                  </div>

                  {/* Статус предложения */}
                  <div>
                    {isAccepted && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        ОФФЕР ПРИНЯТ • КОНТАКТЫ ПЕРЕДАНЫ
                      </span>
                    )}
                    {isDeclined && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-500 border border-slate-200 font-mono text-xs font-bold">
                        <XCircle className="w-3.5 h-3.5" />
                        ОТКЛОНЕНО ВАМИ
                      </span>
                    )}
                    {isPending && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-mono text-xs font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        ОЖИДАЕТ ВАШЕГО РЕШЕНИЯ
                      </span>
                    )}
                  </div>
                </div>

                {/* Сообщение и условия */}
                <div className="space-y-3">
                  <div className="text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed font-sans">
                    {inv.message}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-slate-200/80 bg-slate-50/50">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                        Гарантированная зарплатная вилка предложения:
                      </div>
                      <div className="text-lg font-mono font-extrabold text-slate-900 mt-0.5">
                        {inv.salary_from.toLocaleString('ru-RU')} - {inv.salary_to.toLocaleString('ru-RU')} ₽
                        <span className="text-xs text-slate-500 font-normal ml-2">на руки (Net)</span>
                      </div>
                    </div>

                    <div className="text-xs font-mono text-slate-500">
                      Канал связи: <span className="font-bold text-slate-800 uppercase">{inv.contact_method}</span>
                    </div>
                  </div>
                </div>

                {/* Кнопки действий */}
                {isPending && (
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
                    <button
                      onClick={() => handleAction(inv.id, 'decline')}
                      disabled={loadingId === inv.id}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Отклонить
                    </button>
                    <button
                      onClick={() => handleAction(inv.id, 'accept')}
                      disabled={loadingId === inv.id}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Принять и раскрыть контакты</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
