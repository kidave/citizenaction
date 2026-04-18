"use client";

import { createContext, useContext, useState } from "react";

const MediaContext = createContext();

export function MediaProvider({ children }) {
  const [activeMedia, setActiveMedia] = useState(null);

  return (
    <MediaContext.Provider value={{ activeMedia, setActiveMedia }}>
      {children}
    </MediaContext.Provider>
  );
}

export function useMedia() {
  return useContext(MediaContext);
}