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
  const timeline = useWardTimeline(wardId, true);
  const members = useWardMembers(wardId, true);
  const { roads } = useWardRoads(wardId);
  const actions = useWardActions(wardId, true);
  const junctions = useWardJunctions(wardId, true);
  const boundary = useWardBoundary(wardId, true);
  const projects = useWardProject(wardId, true);

  const wardInfo = timeline.wardInfo || junctions.wardInfo || {
    wardName: 'Unknown',
    convenor: 'Not assigned',
    coConvenor: 'Not assigned'
  };

  const contextValue = useMemo(() => ({
    wardId,
    timeline,
    members,
    roads,
    actions,
    junctions,
    boundary,
    wardInfo,
    projects,
  }), [wardId, timeline, members, roads, actions, junctions, boundary, projects]);

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
