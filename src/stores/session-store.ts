import { create } from 'zustand';

interface SessionState {
  isAuthenticated: boolean | null; // null = no verificado, true = autenticado, false = no autenticado
  isValidating: boolean;
  setAuthenticated: (isAuth: boolean) => void;
  setValidating: (isValidating: boolean) => void;
  resetSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  isAuthenticated: null, // Estado inicial: no verificado
  isValidating: false,
  
  setAuthenticated: (isAuth: boolean) => 
    set({ isAuthenticated: isAuth, isValidating: false }),
  
  setValidating: (isValidating: boolean) => 
    set({ isValidating }),
  
  resetSession: () => 
    set({ isAuthenticated: null, isValidating: false }),
}));
