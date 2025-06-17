import { createContext, useContext, useMemo } from 'react';
import { 
  useWardMetrics, 
  useWardTimeline, 
  useWardActions, 
  useWardMembers, 
  useWardRoads,
  useWardJunctions
} from '../hooks';

const WardContext = createContext();

export function WardProvider({ children, wardId }) {
  const metrics = useWardMetrics(wardId);
  const timeline = useWardTimeline(wardId);
  const members = useWardMembers(wardId);
  const roads = useWardRoads(wardId);
  const actions = useWardActions(wardId);
  const junctions = useWardJunctions(wardId);

  const wardInfo = timeline.wardInfo || junctions.wardInfo || {
    wardName: 'Unknown',
    convenor: 'Not assigned',
    coConvenor: 'Not assigned'
  };

  const contextValue = useMemo(() => ({
    wardId,
    metrics,
    timeline,
    members,
    roads,
    actions,
    junctions,
    wardInfo 
  }), [wardId, metrics, timeline, members, roads, actions, junctions]);

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
