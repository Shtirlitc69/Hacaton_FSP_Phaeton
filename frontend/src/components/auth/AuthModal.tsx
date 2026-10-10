import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { AuthSession } from '../../types';
import { ShieldCheck, Lock, Mail, User, Building2, X, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (session: AuthSession) => void;
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'candidate' | 'employer'>('candidate');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptPdn, setAcceptPdn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Пожалуйста, заполните все обязательные поля');
      return;
    }

    if (tab === 'register') {
      if (password !== confirmPassword) {
        setError('Введенные пароли не совпадают');
        return;
      }
      if (!acceptPdn) {
        setError('Для регистрации необходимо подтвердить согласие на обработку ПДн по 152-ФЗ');
        return;
      }
    }

    setLoading(true);
    try {
      if (tab === 'login') {
        const session = await api.login(email, password);
        onSuccess(session);
        onClose();
      } else {
        const session = await api.register({
          email,
          password,
          role,
          accept_pdn_consent: acceptPdn
        });
        onSuccess(session);
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Ошибка авторизации. Проверьте введенные данные.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl max-w-md w-full overflow-hidden animate-slide-up">
        {/* Header модального окна */}
        <div className="bg-[#0B0F19] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 font-mono text-[11px] tracking-wider text-blue-400 uppercase">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>ЕДИНАЯ СИСТЕМА АВТОРИЗАЦИИ ФСП • 152-ФЗ</span>
          </div>

          <h3 className="text-xl font-bold tracking-tight text-white mt-1">
            {tab === 'login' ? 'Вход в платформу' : 'Регистрация аккаунта'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {tab === 'login'
              ? 'Войдите под вашей учетной записью соискателя или компании'
              : 'Создайте верифицированный профиль с гарантией защиты данных'}
          </p>

          {/* Переключатель Вход / Регистрация */}
          <div className="mt-4 flex rounded-lg bg-slate-900/90 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => { setTab('login'); setError(null); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                tab === 'login'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Вход
            </button>
            <button
              type="button"
              onClick={() => { setTab('register'); setError(null); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                tab === 'register'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Регистрация
            </button>
          </div>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* Выбор роли при регистрации */}
          {tab === 'register' && (
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold uppercase text-slate-600">
                Ваша роль в платформе:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('candidate')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                    role === 'candidate'
                      ? 'border-blue-600 bg-blue-50/70 text-slate-900 ring-1 ring-blue-600'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <User className={`w-4 h-4 ${role === 'candidate' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <div>
                    <div className="text-xs font-bold">Соискатель</div>
                    <div className="text-[10px] text-slate-500">ИТ-специалист</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('employer')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                    role === 'employer'
                      ? 'border-blue-600 bg-blue-50/70 text-slate-900 ring-1 ring-blue-600'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <Building2 className={`w-4 h-4 ${role === 'employer' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <div>
                    <div className="text-xs font-bold">Работодатель</div>
                    <div className="text-[10px] text-slate-500">Компания / HR</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Электронная почта</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === 'candidate' ? 'dev@example.ru' : 'hr@company.ru'}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-xs font-medium"
              />
            </div>
          </div>

          {/* Пароль */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Пароль</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 8 символов"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-xs font-medium"
              />
            </div>
          </div>

          {/* Подтверждение пароля при регистрации */}
          {tab === 'register' && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Повторите пароль</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повторите введенный пароль"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-xs font-medium"
                />
              </div>
            </div>
          )}

          {/* Согласие 152-ФЗ */}
          {tab === 'register' && (
            <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptPdn}
                onChange={(e) => setAcceptPdn(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className="text-[11px] text-slate-600 leading-tight">
                Я даю согласие на обработку персональных данных в соответствии со ст. 9 Федерального закона № 152-ФЗ и регламентом платформы ФСП.
              </span>
            </label>
          )}

          {/* Кнопка отправки */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
          >
            <span>{loading ? 'Проверка данных...' : (tab === 'login' ? 'Войти в личный кабинет' : 'Завершить регистрацию')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Демо-подсказка для жюри */}
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 text-center">
            Для быстрой проверки жюри также доступна панель демо-персон вверху экрана.
          </div>
        </form>
      </div>
    </div>
  );
};
