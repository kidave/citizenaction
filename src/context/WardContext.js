// In WardContext.js

import { createContext, useContext, useMemo } from 'react';
import { 
  useWardTimeline, 
  useWardActions, 
  useWardMembers, 
  useWardRoads,
  useWardJunctions,
  useWardBoundary,
  useWardProject
} from '../hooks';

const WardContext = createContext();

export function WardProvider({ children, wardId }) {
  // Destructure EVERY hook's result object
  const { timeline, wardInfo: timelineWardInfo } = useWardTimeline(wardId, true);
  const { members } = useWardMembers(wardId, true); // This returns { members: [...] }
  const { roads } = useWardRoads(wardId); // This returns { roads: [...] }
  const { actions } = useWardActions(wardId, true); // This returns { actions: [...] }
  const { junctions, wardInfo: junctionsWardInfo } = useWardJunctions(wardId, true); // This returns { junctions: [...], wardInfo: {...} }
  const { boundary } = useWardBoundary(wardId, true); // This returns { boundary: {...} }
  const { projects } = useWardProject(wardId, true); // This returns { projects: [...] }

  // Consolidate wardInfo from the most reliable source
  const wardInfo = timelineWardInfo || junctionsWardInfo || {
    wardName: 'Unknown',
    convenor: 'Not assigned',
    coConvenor: 'Not assigned'
  };

  const contextValue = useMemo(() => ({
    wardId,
    // Provide the actual data ARRAYS to the context, with fallbacks
    timeline: timeline || [],
    members: members || [],
    roads: roads || [],
    actions: actions || [],
    junctions: junctions || [],
    boundary: boundary || null,
    projects: projects || [],
    wardInfo,
  }), [wardId, timeline, members, roads, actions, junctions, boundary, projects, wardInfo]);

  return (
    <WardContext.Provider value={contextValue}>
      {children}
    </WardContext.Provider>
  );
}

export function useWard() {
  const context = useContext(WardContext);
  if (!context) {
    throw new Error('useWard must be used within a WardProvider');
  }
  return context;
}