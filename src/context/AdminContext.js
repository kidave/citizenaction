// context/AdminContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { useRouter } from "next/router";

const AdminContext = createContext();

export function AdminProvider({ children, wardCode }) {
  const { getAccessToken, user } = useAuth();
  const [roleId, setRoleId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (!user || !wardCode || hasFetched) {
      if (!user || !wardCode) {
        setRoleId(null);
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
        setRoleId(data?.role_id || null);
        setHasFetched(true); // Mark as fetched to prevent re-fetching
      } catch (e) {
        console.error("Error fetching admin role:", e);
        setRoleId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [user, wardCode, getAccessToken, hasFetched]); // Added hasFetched dependency

  const isAdmin = roleId && [1, 2, 3].includes(roleId);

  return (
    <AdminContext.Provider value={{ roleId, isAdmin, loading }}>
      {children}
    </AdminContext.Provider>
  );
}

// useAdmin hook remains the same
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