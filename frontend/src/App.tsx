import React, { useState } from 'react';
import { DemoPersona } from './types';
import { DEMO_PERSONAS, PersonaSwitcher } from './components/shared/PersonaSwitcher';
import { Navbar } from './components/layout/Navbar';
import { CandidateDashboard } from './components/candidate/CandidateDashboard';
import { AssessmentRunner } from './components/candidate/AssessmentRunner';
import { EmployerDashboard } from './components/employer/EmployerDashboard';

export const App: React.FC = () => {
  const [currentPersona, setCurrentPersona] = useState<DemoPersona>(DEMO_PERSONAS[0]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'assessment' | 'invitations'>('dashboard');

  const handlePersonaSelect = (p: DemoPersona) => {
    setCurrentPersona(p);
    setActiveTab('dashboard');
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
        setActiveTab={setActiveTab}
      />

      {/* 3. Основной контент рабочей области */}
      <main className="flex-1 pb-16">
        {currentPersona.role === 'candidate' ? (
          activeTab === 'assessment' ? (
            <AssessmentRunner onFinish={() => setActiveTab('dashboard')} />
          ) : (
            <CandidateDashboard
              persona={currentPersona}
              onStartAssessment={() => setActiveTab('assessment')}
            />
          )
        ) : (
          <EmployerDashboard persona={currentPersona} />
        )}
      </main>

      {/* 4. Футер платформы */}
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
