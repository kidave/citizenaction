import { createContext, useContext, useMemo, useEffect } from "react";
import useWardHeader from "hooks/useWardHeader";
import useWardMeetings from "hooks/useWardMeetings";
import useWardUpdates from "hooks/useWardUpdates";
import useWardCommittees from "hooks/useWardCommittees";
import useWardRoads from "hooks/useWardRoads";
import useWardJunctions from "hooks/useWardJunctions";
import useWardProjects from "hooks/useWardProjects";
import Spinner from "components/shared/ui/Spinner";
import { useRegionData } from "hooks/useRegionData";

const WardContext = createContext();

export function WardProvider({ children, wardId }) {
  const { setNavigatingWard } = useRegionData();
  const {
    wardInfo,
    loading: infoLoading,
    error: infoError,
  } = useWardHeader(wardId);
  const {
    meetings,
    loading: meetingsLoading,
    error: meetingsError,
  } = useWardMeetings(wardId);
  const {
    updates,
    loading: updatesLoading,
    error: updatesError,
  } = useWardUpdates(wardId);
  const {
    committees,
    loading: committeesLoading,
    error: committeesError,
  } = useWardCommittees(wardId);
  const {
    roads,
    loading: roadsLoading,
    error: roadsError,
  } = useWardRoads(wardId);
  const {
    junctions,
    loading: junctionsLoading,
    error: junctionsError,
  } = useWardJunctions(wardId);
  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
  } = useWardProjects(wardId);

  const loading =
    infoLoading ||
    meetingsLoading ||
    updatesLoading ||
    committeesLoading ||
    roadsLoading ||
    junctionsLoading ||
    projectsLoading;

    useEffect(() => {
    if (!loading) {
      setNavigatingWard(null); // clear the "Loading ward..." lock once finished
    }
  }, [loading, setNavigatingWard]);

  const error =
    infoError ||
    meetingsError ||
    updatesError ||
    committeesError ||
    roadsError ||
    junctionsError ||
    projectsError;

  const contextValue = useMemo(
    () => ({
      wardId,
      wardInfo,
      meetings,
      updates,
      committees,
      roads,
      junctions,
      projects,
      loading,
      error,
    }),
    [
      wardId,
      wardInfo,
      meetings,
      updates,
      committees,
      roads,
      junctions,
      projects,
      loading,
      error,
    ],
  );

  return (
    <WardContext.Provider value={contextValue}>
      {loading ? <Spinner mode="fullscreen" /> : children}
    </WardContext.Provider>
  );
}

export function useWard() {
  const context = useContext(WardContext);
  if (!context) throw new Error("useWard must be used within a WardProvider");
  return context;
}
