const express = require('express');
const { addEvent, getAllEvents, getEventById, deleteEvent } = require('../controllers/calendarController');

const router = express.Router();

router.post('/add', addEvent);
router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.delete('/:id', deleteEvent);

module.exports = router;
