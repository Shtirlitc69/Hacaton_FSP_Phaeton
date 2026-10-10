import React, { useState } from 'react';
import { Vacancy } from '../../types';
import { api } from '../../lib/api';
import { Search, Briefcase, Building2, Send, X, CheckCircle2 } from 'lucide-react';

interface Props {
  vacancies: Vacancy[];
  candidateId: number;
  onToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

export const VacanciesCatalogView: React.FC<Props> = ({ vacancies, candidateId, onToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
  const [coverLetter, setCoverLetter] = useState('Здравствуйте! Меня заинтересовала ваша открытая позиция. Мой профиль и грейд подтверждены адаптивным тестированием ФСП.');
  const [submitting, setSubmitting] = useState(false);
  const [appliedIds, setAppliedIds] = useState<Record<number, boolean>>({});

  const filtered = vacancies.filter(v =>
    v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleApply = async () => {
    if (!selectedVacancy) return;
    setSubmitting(true);
    try {
      await api.applyToVacancy(selectedVacancy.id, candidateId, coverLetter);
      setAppliedIds(prev => ({ ...prev, [selectedVacancy.id]: true }));
      onToast(
        'Отклик успешно направлен!',
        `Ваше резюме и подтвержденный профиль ФСП переданы в компанию «${selectedVacancy.company_name}».`,
        'success'
      );
      setSelectedVacancy(null);
    } catch (e) {
      onToast('Ошибка', 'Не удалось отправить отклик', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8 space-y-6 animate-fade-in">
      {/* Шапка */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-blue-600 font-bold">
            <Briefcase className="w-4 h-4" />
            <span>Каталог вакансий • Классический сценарий (Бонус 7%)</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
            Открытые позиции работодателей ({vacancies.length})
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Возможность самостоятельно проявить инициативу и откликнуться на опубликованные вакансии компаний.
          </p>
        </div>

        {/* Поиск */}
        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Поиск по стеку или названию..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-xs font-medium"
          />
        </div>
      </div>

      {/* Список вакансий */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((v) => {
          const isApplied = appliedIds[v.id];

          return (
            <div
              key={v.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                      <Building2 className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{v.company_name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{v.created_at}</div>
                    </div>
                  </div>

                  <span className="font-mono text-xs font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                    {v.salary_from.toLocaleString('ru-RU')} - {v.salary_to.toLocaleString('ru-RU')} ₽
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {v.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {v.description}
                </p>

                {/* Теги стека */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {v.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Кнопка отклика */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">Прямой отклик соискателя</span>
                {isApplied ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 font-mono text-xs font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4" />
                    ОТКЛИК ОТПРАВЛЕН
                  </span>
                ) : (
                  <button
                    onClick={() => setSelectedVacancy(v)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Откликнуться</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Модальное окно прямого отклика */}
      {selectedVacancy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-slide-up">
            <div className="bg-[#0B0F19] text-white p-6 relative">
              <button
                onClick={() => setSelectedVacancy(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-[10px] font-mono uppercase tracking-widest text-blue-400">
                ПРЯМОЙ ОТКЛИК НА ВАКАНСИЮ
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                {selectedVacancy.title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Компания: {selectedVacancy.company_name} • Вилка: {selectedVacancy.salary_from.toLocaleString('ru-RU')} - {selectedVacancy.salary_to.toLocaleString('ru-RU')} ₽
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold uppercase text-slate-600">
                  Сопроводительное письмо:
                </label>
                <textarea
                  rows={4}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 leading-relaxed font-sans"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                💡 При прямом отклике работодателю сразу передаются ваши контактные данные и верифицированные результаты CAT-теста ФСП.
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedVacancy(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
                >
                  Отмена
                </button>
                <button
                  onClick={handleApply}
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span>{submitting ? 'Отправка...' : 'Отправить отклик'}</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
