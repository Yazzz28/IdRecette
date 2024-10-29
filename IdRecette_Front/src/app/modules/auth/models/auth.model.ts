// auth.models.ts
export interface GeneralInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    birthDate: Date;
    address: string;
  }
  
  export interface Allergy {
    name: string;
    severity: 'low' | 'medium' | 'high';
    description?: string;
  }
  
  export interface AllergyInfo {
    hasAllergies: boolean;
    allergies: Allergy[];
    medications?: string[];
  }
  
  export interface DietInfo {
    dietType: 'regular' | 'vegetarian' | 'vegan' | 'other';
    restrictions: string[];
    preferences: string[];
    intolerances: string[];
  }
  
  export interface AuthState {
    currentStep: number;
    generalInfo?: GeneralInfo;
    allergyInfo?: AllergyInfo;
    dietInfo?: DietInfo;
    isCompleted: boolean;
  }