// hooks/useProjectJunctions.js
import { useWardJunctions } from "./useWardData";
import { useWardProjects } from "./useWardData";

export const useProjectJunctions = (wardCode) => {
  const { 
    data: junctions, 
    loading: junctionsLoading, 
    error: junctionsError 
  } = useWardJunctions(wardCode);
  
  const { 
    data: projects, 
    loading: projectsLoading, 
    error: projectsError 
  } = useWardProjects(wardCode);

  // Connect junctions with their projects
  const junctionsWithProjects = junctions?.map(junction => {
    const relatedProject = projects?.find(project => 
      project.junction_fid === junction.fid || 
      project.junction_name === junction.name
    );
    
    return {
      ...junction,
      project: relatedProject || null
    };
  }) || [];

  return {
    data: junctionsWithProjects,
    loading: junctionsLoading || projectsLoading,
    error: junctionsError || projectsError
  };
};