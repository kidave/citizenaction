// context/AppContext.js
import { createContext, useContext, useMemo } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const auth = useAuth(); // Your existing auth logic
  const ward = useWard(); // Your existing ward logic

  const value = useMemo(() => ({
    auth,
    ward
  }), [auth, ward]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}