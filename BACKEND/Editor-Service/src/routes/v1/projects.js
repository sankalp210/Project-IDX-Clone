import express from 'express'
import { createProjectController, getProjectTreeController, getUserProjectsController, deleteProjectController } from '../../controllers/projectController.js';

const router = express.Router();

router.post('/', createProjectController);

router.get('/:projectId/tree', getProjectTreeController);

router.get('/user/:userId', getUserProjectsController);

router.delete("/:projectId", deleteProjectController);

export default router;


