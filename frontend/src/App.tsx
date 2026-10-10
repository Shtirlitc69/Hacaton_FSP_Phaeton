import React, { useState, useEffect, useCallback } from 'react';
import { DemoPersona, AuthSession, ToastNotification, Vacancy, DailyChallenge, Invitation } from './types';
import { DEMO_PERSONAS, PersonaSwitcher } from './components/shared/PersonaSwitcher';
import { Navbar, AppTab } from './components/layout/Navbar';
import { CandidateDashboard } from './components/candidate/CandidateDashboard';
import { AssessmentRunner } from './components/candidate/AssessmentRunner';
import { CandidateInvitationsView } from './components/candidate/CandidateInvitationsView';
import { DailyChallengesView } from './components/candidate/DailyChallengesView';
import { VacanciesCatalogView } from './components/candidate/VacanciesCatalogView';
import { CandidateOnboardingModal } from './components/candidate/CandidateOnboardingModal';
import { EmployerDashboard } from './components/employer/EmployerDashboard';
import { EmployerInvitationsView } from './components/employer/EmployerInvitationsView';
import { CreateVacancyModal } from './components/employer/CreateVacancyModal';
import { AuthModal } from './components/auth/AuthModal';
import { ToastContainer } from './components/shared/ToastContainer';
import { api } from './lib/api';

export const App: React.FC = () => {
  const [currentPersona, setCurrentPersona] = useState<DemoPersona>(DEMO_PERSONAS[0]);
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [session, setSession] = useState<AuthSession | null>(api.getStoredSession());

  // Состояние всплывающих уведомлений (Toast)
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Состояние модальных окон
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [isCreateVacancyModalOpen, setIsCreateVacancyModalOpen] = useState(false);

  // Данные приложения
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  const addToast = useCallback((title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Первичная и периодическая загрузка данных
  const loadData = useCallback(async () => {
    try {
      const [vList, cList, iList] = await Promise.all([
        api.getVacancies(),
        api.getDailyChallenges(),
        api.getInvitations(currentPersona.role === 'candidate' ? currentPersona.candidateId : undefined)
      ]);
      setVacancies(vList);
      setChallenges(cList);
      setInvitations(iList);
    } catch (e) {
      console.warn('Использованы демонстрационные данные платформы');
    }
  }, [currentPersona]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Обработка выбора персоны из демо-панели жюри
  const handlePersonaSelect = (p: DemoPersona) => {
    setCurrentPersona(p);
    setActiveTab('dashboard');
  };

  // Обработка переключения вкладок в Navbar
  const handleTabChange = (tab: AppTab) => {
    if (tab === 'create_vacancy') {
      setIsCreateVacancyModalOpen(true);
      return;
    }
    setActiveTab(tab);
  };

  // Успешная авторизация или регистрация
  const handleAuthSuccess = (newSession: AuthSession) => {
    setSession(newSession);
    const dynamicPersona: DemoPersona = {
      id: `user_${newSession.userId}`,
      name: newSession.nameOrTitle || (newSession.role === 'candidate' ? 'Соискатель' : 'Работодатель'),
      role: newSession.role,
      badge: newSession.role === 'candidate' ? 'ВЕРИФИЦИРОВАН' : 'АККРЕДИТОВАН',
      description:
        newSession.role === 'candidate'
          ? 'Зарегистрированный кандидат с защитой ПДн по 152-ФЗ'
          : `Представитель компании ${newSession.company_name || 'ИТ-Партнера ФСП'}`,
      candidateId: newSession.role === 'candidate' ? newSession.userId : undefined,
      companyName: newSession.company_name
    };

    setCurrentPersona(dynamicPersona);
    setActiveTab('dashboard');
    addToast(
      'Авторизация выполнена',
      `Добро пожаловать в систему, ${dynamicPersona.name}! Сессия верифицирована.`,
      'success'
    );

    // Если кандидат только что зарегистрировался, предложим настроить профиль
    if (newSession.role === 'candidate') {
      setIsOnboardingModalOpen(true);
    }
  };

  const handleLogout = () => {
    api.logout();
    setSession(null);
    setCurrentPersona(DEMO_PERSONAS[0]);
    setActiveTab('dashboard');
    addToast('Выход выполнен', 'Сеанс работы завершен.', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 1. Верхний переключатель ролей (Demo Persona Switcher в 1 клик для жюри) */}
      <PersonaSwitcher
        currentPersona={currentPersona}
        onSelectPersona={handlePersonaSelect}
      />

      {/* 2. Основная навигационная панель */}
      <Navbar
        currentPersona={currentPersona}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        session={session}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* 3. Основной контент рабочей области */}
      <main className="flex-1 pb-16">
        {currentPersona.role === 'candidate' ? (
          activeTab === 'assessment' ? (
            <AssessmentRunner
              onFinish={() => {
                setActiveTab('dashboard');
                addToast('Тестирование завершено', 'Грейд и способность θ успешно обновлены в вашем профиле.', 'success');
              }}
            />
          ) : activeTab === 'invitations' ? (
            <CandidateInvitationsView
              invitations={invitations}
              onRefresh={loadData}
              onToast={addToast}
            />
          ) : activeTab === 'challenges' ? (
            <DailyChallengesView
              challenges={challenges}
              candidateId={currentPersona.candidateId || 2}
              onRefresh={loadData}
              onToast={addToast}
            />
          ) : activeTab === 'vacancies' ? (
            <VacanciesCatalogView
              vacancies={vacancies}
              candidateId={currentPersona.candidateId || 2}
              onToast={addToast}
            />
          ) : (
            <CandidateDashboard
              persona={currentPersona}
              onStartAssessment={() => setActiveTab('assessment')}
              onOpenOnboarding={() => setIsOnboardingModalOpen(true)}
              onToast={addToast}
            />
          )
        ) : (
          activeTab === 'invitations' ? (
            <EmployerInvitationsView
              invitations={invitations}
              onToast={addToast}
            />
          ) : activeTab === 'vacancies' ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Каталог открытых позиций компании</h2>
                  <p className="text-xs text-slate-500">Управление требованиями и просмотр опубликованных вакансий на платформе</p>
                </div>
                <button
                  onClick={() => setIsCreateVacancyModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  + Опубликовать вакансию
                </button>
              </div>
              <VacanciesCatalogView
                vacancies={vacancies}
                candidateId={0}
                onToast={addToast}
              />
            </div>
          ) : (
            <EmployerDashboard persona={currentPersona} />
          )
        )}
      </main>

      {/* 4. Модальные окна */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <CandidateOnboardingModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        onStartTest={() => {
          setActiveTab('assessment');
        }}
        onSaveProfile={async (data) => {
          await api.updateCandidateProfile(currentPersona.candidateId || 2, data);
          if (data.fsp_id) {
            await api.linkFspProfile(currentPersona.candidateId || 2, data.fsp_id);
          }
          addToast('Профиль сохранен', 'Зарплатные ожидания и параметры профиля зафиксированы.', 'success');
          loadData();
        }}
      />

      <CreateVacancyModal
        isOpen={isCreateVacancyModalOpen}
        onClose={() => setIsCreateVacancyModalOpen(false)}
        onSuccess={loadData}
        onToast={addToast}
      />

      {/* 5. Система всплывающих уведомлений */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* 6. Футер платформы */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800">ФСП Карьера</span>
            <span>•</span>
            <span>Хакатон Федерации спортивного программирования 2026</span>
          </div>
          <div>
            Соответствие Федеральному закону № 152-ФЗ • 2PL IRT Bayes EAP • Reverse Recruitment
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
