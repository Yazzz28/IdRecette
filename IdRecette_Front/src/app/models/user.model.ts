export interface User {
    id: number;
    email: string;
    roles: string[];
    password: string;
    pseudo: string;
    diets: Diet[];
    allergy: Category[];
    favorite: Recipe[];
  }
  
  export interface Diet {
    id: number;
    name: string;
  }
  
  export interface Category {
    id: number;
    name: string;
  }
  
  export interface Recipe {
    id: number;
    name: string;
  }