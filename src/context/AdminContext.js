// context/AdminContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { useRouter } from "next/router";

const AdminContext = createContext();

export function AdminProvider({ children, wardCode }) {
  const { getAccessToken, user } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [scopeType, setScopeType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (!user || !wardCode || hasFetched) {
      if (!user || !wardCode) {
        setUserRole(null);
        setScopeType(null);
        setLoading(false);
      }
      return;
    }

    const fetchRole = async () => {
      setLoading(true);
      try {
        const token = await getAccessToken();
        const res = await fetch(`/api/ward/${wardCode}/role`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        
        // Updated to use scope_role and scope_type
        setUserRole(data?.scope_role || null);
        setScopeType(data?.scope_type || null);
        setHasFetched(true);
      } catch (e) {
        console.error("Error fetching admin role:", e);
        setUserRole(null);
        setScopeType(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [user, wardCode, getAccessToken, hasFetched]);

  // Updated admin check using scope_role
  const isAdmin = userRole && ['Convener', 'Co Convener', 'Member'].includes(userRole);
  const isLeader = userRole && ['Convener', 'Co Convener', 'Member'].includes(userRole);
  const isConvener = userRole === 'Convener';

  return (
    <AdminContext.Provider value={{ 
      userRole, 
      scopeType, 
      isAdmin, 
      isLeader, 
      isConvener,
      loading 
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin({ require = false, wardCode, fallbackTab = "meeting" } = {}) {
  const ctx = useContext(AdminContext);
  const router = useRouter();

  useEffect(() => {
    if (!ctx.loading && require && !ctx.isAdmin && wardCode) {
      router.replace(`/ward/${wardCode}/${fallbackTab}`);
    }
  }, [ctx.loading, ctx.isAdmin, require, wardCode, fallbackTab, router]);

  return ctx;
}