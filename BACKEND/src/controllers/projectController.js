import { createProjectService, getProjectTreeService, getUserProjectsService, deleteProjectService } from '../service/projectService.js';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);


export const createProjectController = async (req, res) => {
  try {
    console.log("🟢 [Controller] Received POST request to /projects");

    const { userId } = req.body;
    console.log("🟡 [Controller] Extracted userId:", userId);

    if (!userId) {
      console.warn("🔴 [Controller] userId is missing in request body");
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    console.log("🟢 [Controller] Creating project for user:", userId);
    const projectId = await createProjectService(userId);
    console.log("🟢 [Controller] Project created successfully with ID:", projectId);
    
    return res.status(201).json({
      success: true,
      message: 'Project created',
      data: projectId,
      
    });
    

  } catch (error) {
    console.error("🔴 [Controller Error]", error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message, // 🔍 helpful for debugging from frontend
    });
  }
};


export const getProjectTreeController = async (req, res) => {
  try {
    const projectId = req.params.projectId;
//     console.log("📦 req.query:", req.query);
// console.log("📦 req.headers.authorization:", req.headers['authorization']);
    // Try both: header token and fallback to query param
    let userId = req.query.userId;

    if (!userId) {
      const token = req.headers['authorization']?.split(' ')[1];
      if (token) {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (user) userId = user.id;
      }
    }

    if (!userId) throw new Error("Missing userId");

    const tree = await getProjectTreeService(projectId, userId);
    console.log("🌳 Tree fetched for", userId, "=>", projectId);
    res.status(200).json({ success: true, data: tree });
  } catch (err) {
    console.error("🌩️ Tree Controller Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};





export const getUserProjectsController = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    const projects = await getUserProjectsService(userId);

    return res.status(200).json({
      success: true,
      message: 'Projects fetched',
      data: projects,
    });
  } catch (error) {
    console.error("Error in getUserProjectsController:", error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};


export const deleteProjectController = async (req, res) => {
  try {
    const { projectId } = req.params;
    const token = req.headers['authorization']?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user || !projectId) {
      return res.status(400).json({ success: false, message: "Missing credentials" });
    }

    await deleteProjectService(projectId, user.id);
    return res.status(200).json({ success: true, message: "Project deleted successfully" });
  } catch (err) {
    console.error("Error deleting project:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
