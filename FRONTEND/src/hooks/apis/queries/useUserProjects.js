// src/hooks/apis/queries/useUserProjects.js
import { useQuery } from '@tanstack/react-query';
import { getUserProjects } from '../../../apis/projects';

export const useUserProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: getUserProjects,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
