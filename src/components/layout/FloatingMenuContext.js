"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

const FloatingMenuContext = createContext(null);

export function FloatingMenuProvider({ children }) {
  const sidebarToggleRef = useRef(null);
  const [hasSidebarToggle, setHasSidebarToggle] = useState(false);

  const registerSidebarToggle = useCallback((toggle) => {
    sidebarToggleRef.current = toggle;
    setHasSidebarToggle(Boolean(toggle));

    return () => {
      if (sidebarToggleRef.current === toggle) {
        sidebarToggleRef.current = null;
        setHasSidebarToggle(false);
      }
    };
  }, []);

  const toggleSidebar = useCallback(() => {
    sidebarToggleRef.current?.();
  }, []);

  return (
    <FloatingMenuContext.Provider
      value={{ hasSidebarToggle, registerSidebarToggle, toggleSidebar }}
    >
      {children}
    </FloatingMenuContext.Provider>
  );
}

export function useFloatingMenu() {
  const context = useContext(FloatingMenuContext);

  if (!context) {
    throw new Error("useFloatingMenu must be used within a FloatingMenuProvider.");
  }

  return context;
}
