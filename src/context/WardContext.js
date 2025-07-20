// components/context/WardContext.js
import { createContext, useContext, useMemo } from 'react';
import { 
  useWardInfo,
  useWardMeetings,
  useWardUpdates,
  useWardActions, 
  useWardMembers, 
  useWardRoads,
  useWardJunctions,
  useWardBoundary,
  useWardProjects
} from '../hooks/ward';

const WardContext = createContext();

export function WardProvider({ children, wardId }) {
  // Primary ward information hook
  const { 
    wardInfo, 
    loading: infoLoading, 
    error: infoError 
  } = useWardInfo(wardId);
  
  // Data collection hooks
  const { 
    meetings, 
    loading: meetingsLoading, 
    error: meetingsError 
  } = useWardMeetings(wardId);
  
  const { 
    updates, 
    loading: updatesLoading, 
    error: updatesError 
  } = useWardUpdates(wardId);

  // Secondary data hooks (lazy load when needed)
  const { members } = useWardMembers(wardId);
  const { roads } = useWardRoads(wardId);
  const { actions } = useWardActions(wardId);
  const { junctions } = useWardJunctions(wardId);
  const { boundary } = useWardBoundary(wardId);
  const { projects } = useWardProjects(wardId);

  // Aggregate loading and error states
  const loading = infoLoading || meetingsLoading || updatesLoading;
  const error = infoError || meetingsError || updatesError;

  const contextValue = useMemo(() => ({
    wardId,
    wardInfo: wardInfo || {
      wardName: 'Unknown',
      convenor: 'Not assigned',
      convenorEmail: '',
      coConvenor: 'Not assigned',
      coConvenorEmail: ''
    },
    meetings: meetings || [],
    updates: updates || [],
    members: members || [],
    roads: roads || [],
    actions: actions || [],
    junctions: junctions || [],
    boundary: boundary || null,
    projects: projects || [],
    loading,
    error,
  }), [
    wardId,
    wardInfo,
    meetings,
    updates,
    members,
    roads,
    actions,
    junctions,
    boundary,
    projects,
    loading,
    error
  ]);

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