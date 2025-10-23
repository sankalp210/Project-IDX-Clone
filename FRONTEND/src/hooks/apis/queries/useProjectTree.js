import { getProjectTree } from "../../../apis/projects";

export const useProjectTree = (projectId) => {
  const { isLoading, isError, data, error } = useQuery({
    queryFn: () => getProjectTree({ projectId }),  
    queryKey: ["projectTree", projectId],
    staleTime: 10000,
    enabled: !!projectId,
  });

  return { isLoading, isError, data, error };
};