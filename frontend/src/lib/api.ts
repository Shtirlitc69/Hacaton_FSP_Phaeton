import { CandidatePublicCard, Invitation, Question } from '../types';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const api = {
  // --- 1. Аутентификация ---
  async login(email: string, role: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'password123' })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // Fallback
    }
    return { access_token: 'mock_jwt_token', role, user_id: 1 };
  },

  // --- 2. Получение рекомендаций кандидатов (Обратный подбор) ---
  async getRankedCandidates(needData: any): Promise<CandidatePublicCard[]> {
    return this.getRecommendations(needData);
  },

  async getRecommendations(needData: any): Promise<CandidatePublicCard[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/matching/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(needData)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, using rich mock recommendations');
    }

    // Реалистичный fallback подборки
    return [
      {
        candidate_id: 1,
        pseudonym: 'Backend-Dev-#101',
        specialization_name: 'Backend-разработка',
        grade_name: 'Middle',
        percentile: 88.0,
        years_of_experience: 2.5,
        city: 'Москва',
        skills: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'Docker'],
        has_fsp: true,
        fsp_summary: 'Серебряный призёр Чемпионата России ФСП 2024',
        preferred_salary_from: 180000,
        preferred_salary_to: 230000,
        match_score: 0.91,
        match_explanation: {
          headline: 'Backend Middle • топ-12% категории • стек 4 из 4 • призёр ФСП • в вилке',
          factors: [
            { name: 'Стек технологий', weight_percent: 30, score_percent: 95, detail: 'Идеальное совпадение: Python, FastAPI, PostgreSQL, Redis' },
            { name: 'Подтверждённый грейд', weight_percent: 25, score_percent: 92, detail: 'Middle подтвержден CAT-тестом (θ = 1.15, 88-й перцентиль)' },
            { name: 'Достижения ФСП', weight_percent: 15, score_percent: 85, detail: '2-е место на Чемпионате России по алгоритмическому программированию' },
            { name: 'Зарплатная вилка', weight_percent: 20, score_percent: 100, detail: 'Ожидания (180 000 - 230 000 ₽) полностью укладываются в ваш бюджет' },
            { name: 'Свежесть активности', weight_percent: 10, score_percent: 90, detail: 'Тест сдан 5 дней назад' }
          ]
        }
      },
      {
        candidate_id: 4,
        pseudonym: 'Backend-Dev-#412',
        specialization_name: 'Backend-разработка',
        grade_name: 'Middle',
        percentile: 78.0,
        years_of_experience: 3.0,
        city: 'Казань',
        skills: ['Python', 'FastAPI', 'Django', 'PostgreSQL'],
        has_fsp: false,
        preferred_salary_from: 170000,
        preferred_salary_to: 220000,
        match_score: 0.86,
        match_explanation: {
          headline: 'Backend Middle • топ-22% категории • стек 3 из 4 • без ФСП (перенормировано) • в вилке',
          factors: [
            { name: 'Стек технологий', weight_percent: 35, score_percent: 80, detail: 'Совпали: Python, FastAPI, PostgreSQL. Не хватает: Redis' },
            { name: 'Подтверждённый грейд', weight_percent: 30, score_percent: 85, detail: 'Middle подтвержден CAT-тестом (θ = 0.80, 78-й перцентиль)' },
            { name: 'Зарплатная вилка', weight_percent: 23, score_percent: 100, detail: 'Ожидания (170 000 - 220 000 ₽) укладываются в диапазон' },
            { name: 'Свежесть профиля', weight_percent: 12, score_percent: 95, detail: 'Активный профиль, решена регулярная микро-задача' }
          ]
        }
      }
    ];
  },

  // --- 3. Приглашения ---
  async getInvitations(candidateId?: number, employerId?: number): Promise<Invitation[]> {
    try {
      const url = candidateId
        ? `${API_BASE_URL}/invitations/?candidate_id=${candidateId}`
        : `${API_BASE_URL}/invitations/?employer_id=${employerId}`;
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, using fallback invitations');
    }

    return [
      {
        id: 101,
        company_name: 'СберТех (ПАО Сбербанк)',
        company_website: 'https://sbertech.ru',
        candidate_pseudonym: 'Backend-Dev-#101',
        title: 'Middle Backend Developer (FastAPI / Redis)',
        message: 'Здравствуйте! Нам очень понравились ваши результаты CAT-теста и серебро на Чемпионате ФСП. Приглашаем обсудить архитектурные задачи в платформенной команде.',
        salary_from: 200000,
        salary_to: 250000,
        contact_method: 'Telegram: @sbertech_lead_hr',
        status: 'SENT',
        created_at: '2026-10-06'
      }
    ];
  },

  async sendInvitation(invitationData: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/invitations/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invitationData)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // Fallback
    }
    return { ...invitationData, id: Math.floor(Math.random() * 1000), status: 'SENT' };
  },

  async respondInvitation(id: number, action: 'accept' | 'decline') {
    try {
      const res = await fetch(`${API_BASE_URL}/invitations/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // Fallback
    }
    return {
      id,
      status: action === 'accept' ? 'ACCEPTED' : 'DECLINED',
      revealed_contacts: action === 'accept' ? {
        first_name: 'Иван',
        last_name: 'Смирнов',
        phone: '+7 (916) 111-22-33',
        email: 'ivan.smirnov@demo.ru',
        telegram: '@ivan_dev_fsp'
      } : undefined
    };
  },

  // --- 4. Адаптивное тестирование (CAT) ---
  async startAssessment(specialization_slug: string, claimed_grade_slug: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/assessment/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specialization_slug, claimed_grade_slug })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // Fallback
    }
    return { session_id: 1, specialization_name: 'Backend-разработка', claimed_grade_name: 'Middle' };
  },

  async getNextQuestion(sessionId: number): Promise<Question> {
    try {
      const res = await fetch(`${API_BASE_URL}/assessment/${sessionId}/next`);
      if (res.ok) return await res.json();
    } catch (e) {
      // Fallback
    }
    return {
      session_id: sessionId,
      question_index: 1,
      template_id: 101,
      template_code: 'ALG-COMPLEX-02',
      question_text: 'Определите асимптотическую временную сложность (Time Complexity) функции с вложенными циклами и динамическим шагом k=4:',
      code: `def process_matrix(matrix, k=4):
    total = 0
    n = len(matrix)
    for i in range(n):
        for j in range(i, n):
            if (matrix[i] + matrix[j]) % k == 0:
                total += 1
    return total`,
      options: ['O(N²)', 'O(N log N)', 'O(N)', 'O(N³)'],
      is_finished: false
    };
  },

  async submitAnswer(sessionId: number, templateId: number, selectedIndex: number, timeSpent: number, tabSwitches: number) {
    try {
      const res = await fetch(`${API_BASE_URL}/assessment/${sessionId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          template_id: templateId,
          selected_option_index: selectedIndex,
          time_spent_seconds: timeSpent,
          tab_switch_count: tabSwitches
        })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // Fallback
    }
    return { is_correct: true, current_theta: 0.85, current_se: 0.32, questions_answered: 8, is_finished: true };
  },

  async finishAssessment(sessionId: number) {
    try {
      const res = await fetch(`${API_BASE_URL}/assessment/${sessionId}/finish`, {
        method: 'POST'
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // Fallback
    }
    return {
      session_id: sessionId,
      specialization_name: 'Backend-разработка',
      assigned_grade_name: 'Middle',
      final_theta: 1.15,
      percentile: 88.0,
      confidence_score: 1.0,
      verified_at: new Date().toISOString()
    };
  }
};
