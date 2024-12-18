const express = require('express');
const { addTask, getAllTasks, getTaskById, deleteTask } = require('../controllers/taskController');

const router = express.Router();

router.post('/add', addTask);
router.get('/', getAllTasks);
router.get('/:id', getTaskById);
router.delete('/:id', deleteTask);

module.exports = router;
