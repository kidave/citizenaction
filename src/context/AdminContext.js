// context/AdminContext.js
import { createContext, useContext, useEffect } from "react";
import { useUserStatus } from "hooks/useUserStatus";
import { useRouter } from "next/router";

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const { data: status, isLoading } = useUserStatus();

  const role = status?.scope_role || null;
  const scope = status?.scope_type || null;

  // Same logic you had:
  const isLeader = role && ["Convener", "Co Convener", "Member"].includes(role);
  const isAdmin = isLeader;
  const isConvener = role === "Convener";

  return (
    <AdminContext.Provider
      value={{
        loading: isLoading,
        userRole: role,
        scopeType: scope,
        status,
        isAdmin,
        isLeader,
        isConvener,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin({ require = false, wardCode, fallbackTab = "meeting" } = {}) {
  const ctx = useContext(AdminContext);
  const router = useRouter();

  // Keep your redirect logic exactly as-is
  useEffect(() => {
    if (!ctx.loading && require) {
      if (!ctx.isAdmin && wardCode) {
        router.replace(`/ward/${wardCode}/${fallbackTab}`);
      }
    }
  }, [ctx.loading, ctx.isAdmin, require, wardCode, fallbackTab, router]);

  return ctx;
}
