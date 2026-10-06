export interface CandidatePublicCard {
  candidate_id: number;
  pseudonym: string;
  specialization_name: string;
  grade_name: string;
  percentile: number;
  years_of_experience: number;
  city: string;
  skills: string[];
  has_fsp: boolean;
  fsp_summary?: string;
  preferred_salary_from?: number;
  preferred_salary_to?: number;
  match_score?: number;
  match_explanation?: {
    headline: string;
    factors: {
      name: string;
      weight_percent: number;
      score_percent: number;
      detail: string;
    }[];
  };
}

export interface Invitation {
  id: number;
  company_name: string;
  company_website?: string;
  candidate_pseudonym: string;
  title: string;
  message: string;
  salary_from: number;
  salary_to: number;
  contact_method: string;
  status: 'DRAFT' | 'SENT' | 'VIEWED' | 'ACCEPTED' | 'DECLINED' | 'WITHDRAWN';
  created_at: string;
  revealed_contacts?: {
    first_name: string;
    last_name: string;
    phone?: string;
    email?: string;
    telegram?: string;
  };
}

export interface Question {
  session_id: number;
  question_index: number;
  template_id: number;
  template_code: string;
  question_text: string;
  code?: string;
  options: string[];
  is_finished: boolean;
}

export interface DemoPersona {
  id: string;
  name: string;
  role: 'candidate' | 'employer';
  description: string;
  candidateId?: number;
  employerId?: number;
  badge: string;
}
