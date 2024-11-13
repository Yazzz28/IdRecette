// auth.models.ts
export interface GeneralInfo {
  username: string;
  email: string;
 password: string;
}

export interface Allergy {
  name: string;
}

export interface DietInfo {
  dietType: 'regular' | 'vegetarian' | 'vegan' | 'other';
}

export interface AuthState {
  currentStep: number;
  generalInfo?: GeneralInfo;
  dietInfo?: DietInfo;
  isCompleted: boolean;
}
