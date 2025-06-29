import axios from '../config/axiosConfig';
import { supabase } from '../config/SupabaseClient';

export const createprojectApi = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    console.log("Sending user ID:", user.id);
    const response = await axios.post("/api/v1/projects", {  
      userId: user.id
    });

    console.log(response.data);
    return response.data;
  } catch (error) {
    console.log("Error creating project:", error);
    throw error;
  }
};


export const getProjectTree = async ({ projectId }) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;

  const response = await axios.get(`/api/v1/projects/${projectId}/tree`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response?.data?.data;
};



export const getUserProjects = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const response = await axios.get(`/api/v1/projects/user/${user.id}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching user projects:", error);
    throw error;
  }
};


// 📁 src/apis/projects.js
export const deleteProjectApi = async (projectId) => {
  const { data: { user }, error } = await supabase.auth.getUser();
  const token = (await supabase.auth.getSession())?.data?.session?.access_token;

  if (!user || !token) throw new Error("User not authenticated");

  await axios.delete(`/api/v1/projects/${projectId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};
