export interface User {
  id: number;
  user_id?: number;
  name: string;
  email: string;
  phone?: string | null;
  age: number;
  gender: string;
  role: string;
  is_approved: number;
  must_change_password: number;
  is_onboarded?: number;
  height?: number | null;
  goals?: string[];
  activity_level?: string | null;
  injuries?: string | null;
  experience_level?: string | null;
  preferred_days?: string[];
  membership?: Membership | null;
}

export interface MembershipPlan {
  id: number;
  plan_name: string;
  price: number;
  duration_days: number;
  description?: string | null;
  features?: string[];
  is_active: boolean;
}

export interface Membership {
  id: number;
  user_id: number;
  plan_id?: number | null;
  membership_type: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'overdue' | 'inactive' | 'pending_approval';
}

export interface Payment {
  id: number;
  user_id: number;
  plan_id?: number | null;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'rejected';
  method: string;
  proof_file?: string | null;
}

export interface GymClass {
  id: number;
  trainer_id?: number | null;
  name: string;
  day: string;
  time: string;
  capacity: number;
  trainer_name?: string;
  booked_count: number;
}

export interface Trainer {
  id: number;
  name: string;
  specialization: string;
  experience_years: number;
}

export interface EquipmentAsset {
  id: number;
  name: string;
  category: string;
  quantity: number;
  location: string;
  status: string;
  last_serviced: string;
  next_service: string;
}

export interface Attendance {
  id: number;
  user_id: number;
  date: string;
  is_present: number;
}

export interface WeightLog {
  id: number;
  user_id: number;
  date: string;
  weight_kg: number;
}
