import React, { useState } from 'react';
import { api } from '../../lib/api';
import { Briefcase, X, Plus } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

export const CreateVacancyModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, onToast }) => {
  const [title, setTitle] = useState('');
  const [specializationId, setSpecializationId] = useState(1);
  const [gradeId, setGradeId] = useState(2);
  const [salaryFrom, setSalaryFrom] = useState(190000);
  const [salaryTo, setSalaryTo] = useState(250000);
  const [skills, setSkills] = useState('Python, FastAPI, PostgreSQL, Docker, Redis');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      onToast('Внимание', 'Заполните название и описание вакансии', 'error');
      return;
    }
    if (salaryFrom > salaryTo) {
      onToast('Ошибка', 'Минимальная зарплата не может быть выше максимальной', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.createVacancy({
        title,
        specialization_id: specializationId,
        grade_id: gradeId,
        salary_from: salaryFrom,
        salary_to: salaryTo,
        required_skills: skills,
        description
      });
      onToast('Успешно', `Вакансия «${title}» опубликована в общем каталоге.`, 'success');
      onSuccess();
      onClose();
    } catch (e) {
      onToast('Ошибка', 'Не удалось опубликовать вакансию', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl max-w-lg w-full overflow-hidden animate-slide-up">
        {/* Шапка */}
        <div className="bg-[#0B0F19] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-[10px] font-mono tracking-widest uppercase text-blue-400 flex items-center gap-2">
            <Briefcase className="w-3.5 h-3.5" />
            <span>ПУБЛИКАЦИЯ ВАКАНСИИ • КЛАССИЧЕСКИЙ РЕКРУТИНГ</span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-white mt-1">
            Новая открытая вакансия
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Вакансия появится в открытом каталоге для прямых откликов соискателей
          </p>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Название позиции</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Middle+ Python Backend Разработчик"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Специализация</label>
              <select
                value={specializationId}
                onChange={(e) => setSpecializationId(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium bg-white"
              >
                <option value={1}>Backend-разработка</option>
                <option value={2}>Frontend-разработка</option>
                <option value={3}>Machine Learning / AI</option>
                <option value={4}>DevOps / SRE</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Целевой грейд</label>
              <select
                value={gradeId}
                onChange={(e) => setGradeId(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium bg-white"
              >
                <option value={1}>Junior (Специалист до 1 г.)</option>
                <option value={2}>Middle (Специалист с опытом)</option>
                <option value={3}>Senior (Ведущий специалист)</option>
              </select>
            </div>
          </div>

          {/* Зарплатная вилка */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Зарплата от (₽, Net)</label>
              <input
                type="number"
                step="5000"
                required
                value={salaryFrom}
                onChange={(e) => setSalaryFrom(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Зарплата до (₽, Net)</label>
              <input
                type="number"
                step="5000"
                required
                value={salaryTo}
                onChange={(e) => setSalaryTo(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>

          {/* Стек */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Требуемые навыки (через запятую)</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          {/* Описание */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Описание задач</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опишите проект, задачи команды и условия работы..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Публикация...' : 'Опубликовать вакансию'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
