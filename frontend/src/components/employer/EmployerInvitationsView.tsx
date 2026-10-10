import React from 'react';
import { Invitation } from '../../types';
import { ShieldCheck, CheckCircle2, Clock, XCircle, Phone, Mail, Send, Copy } from 'lucide-react';

interface Props {
  invitations: Invitation[];
  onToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

export const EmployerInvitationsView: React.FC<Props> = ({ invitations, onToast }) => {
  const handleCopyContacts = (contacts: any) => {
    const text = `ФИО: ${contacts.first_name} ${contacts.last_name}\nТелефон: ${contacts.phone}\nEmail: ${contacts.email}\nTelegram: ${contacts.telegram}`;
    navigator.clipboard.writeText(text);
    onToast('Контакты скопированы', 'Прямые контакты соискателя скопированы в буфер обмена.', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8 space-y-6 animate-fade-in">
      {/* Шапка раздела */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-blue-600 font-bold">
            <Send className="w-4 h-4" />
            <span>Исходящие офферы • Управление контактами</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
            Отправленные приглашения ({invitations.length})
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Отслеживание статусов взаимодействия с кандидатами. Контакты раскрываются мгновенно при подтверждении оффера.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl text-emerald-700 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Соблюдение 152-ФЗ: фиксация передачи в AuditLog</span>
        </div>
      </div>

      {/* Список отправленных офферов */}
      {invitations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Вы пока не направляли приглашений</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Воспользуйтесь разделом «Подбор кандидатов», чтобы найти подходящих специалистов и отправить им персональные офферы.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {invitations.map((inv) => {
            const isAccepted = inv.status === 'ACCEPTED';
            const isDeclined = inv.status === 'DECLINED';
            const isPending = inv.status === 'SENT' || inv.status === 'VIEWED';

            return (
              <div
                key={inv.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-sm transition-all hover:border-slate-300 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
                      <span>КАНДИДАТ: {inv.candidate_pseudonym}</span>
                      <span>•</span>
                      <span>ОФФЕР #{inv.id}</span>
                      <span>•</span>
                      <span>{inv.created_at}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {inv.title}
                    </h3>
                  </div>

                  {/* Статус */}
                  <div>
                    {isAccepted && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        ПРИНЯТО СОИСКАТЕЛЕМ • КОНТАКТЫ ОТКРЫТЫ
                      </span>
                    )}
                    {isPending && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 font-mono text-xs font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        ОЖИДАЕТ РЕШЕНИЯ СОИСКАТЕЛЯ
                      </span>
                    )}
                    {isDeclined && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-500 border border-slate-200 font-mono text-xs font-bold">
                        <XCircle className="w-3.5 h-3.5" />
                        ОТКЛОНЕНО
                      </span>
                    )}
                  </div>
                </div>

                {/* Содержание оффера */}
                <div className="space-y-3">
                  <div className="text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed font-sans">
                    {inv.message}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
                    <div>
                      <span className="text-slate-400">Фиксированная вилка: </span>
                      <span className="font-extrabold text-slate-900 text-sm">
                        {inv.salary_from.toLocaleString('ru-RU')} - {inv.salary_to.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Желаемый канал: </span>
                      <span className="font-bold text-slate-800 uppercase">{inv.contact_method}</span>
                    </div>
                  </div>
                </div>

                {/* Блок раскрытых контактов (при ACCEPTED) */}
                {isAccepted && inv.revealed_contacts ? (
                  <div className="mt-4 p-5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold font-mono text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>ПРЯМЫЕ КОНТАКТНЫЕ ДАННЫЕ СОИСКАТЕЛЯ:</span>
                      </div>
                      <button
                        onClick={() => handleCopyContacts(inv.revealed_contacts)}
                        className="px-3 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Скопировать</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="bg-white p-3 rounded-lg border border-emerald-100">
                        <div className="text-[10px] text-slate-400 font-mono">ФИО:</div>
                        <div className="font-bold text-slate-900 mt-0.5">
                          {inv.revealed_contacts.first_name} {inv.revealed_contacts.last_name}
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-emerald-100">
                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>Телефон:</span>
                        </div>
                        <div className="font-mono font-bold text-slate-900 mt-0.5">
                          {inv.revealed_contacts.phone || 'Не указан'}
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-emerald-100">
                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <Mail className="w-3 h-3 text-emerald-600" />
                          <span>Электронная почта:</span>
                        </div>
                        <div className="font-mono font-bold text-slate-900 mt-0.5">
                          {inv.revealed_contacts.email || 'Не указан'}
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-emerald-100">
                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <Send className="w-3 h-3 text-emerald-600" />
                          <span>Telegram:</span>
                        </div>
                        <div className="font-mono font-bold text-blue-600 mt-0.5">
                          {inv.revealed_contacts.telegram || 'Не указан'}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2 pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Контакты защищены ст. 9 152-ФЗ и откроются автоматически после согласия соискателя.</span>
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
