// src/hooks/apis/queries/useGetUserProjects.js
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../config/supabase';

export const useGetUserProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
  });
};