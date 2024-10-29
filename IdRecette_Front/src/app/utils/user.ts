export type User = {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
  allergy?: Array<string>;
  diet?: Array<string>;
};
