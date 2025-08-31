// context/AdminContext.js
import { createContext, useContext, useMemo } from "react";
import { useWard } from "context/WardContext";
import useUserContext from "hooks/useUserContext";

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const { wardId } = useWard();
  const { data, loading } = useUserContext();

  const value = useMemo(() => {
    if (!data || !wardId) {
      return { isAdmin: false, roleId: null, loading };
    }

    const membership = data.committees.find(c => c.ward_code === wardId);
    const roleId = membership?.role_id || null;
    const isAdmin = [1, 2].includes(roleId);

    return { isAdmin, roleId, loading };
  }, [data, wardId, loading]);

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
