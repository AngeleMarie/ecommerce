import express from 'express';
import problem from '../controllers/problem.js';

const router = express.Router();

router.post('/addProblem', problem.addProblem);
router.get('/getProblem', problem.getAllProblems);
router.get('/getProblem/:id', problem.getProblemById);


export default router;
