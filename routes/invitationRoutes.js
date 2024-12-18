const express = require('express');
const { inviteMember, getAllMembers, updateStatus } = require('../controllers/memberController');

const router = express.Router();

router.post('/invite', inviteMember); 
router.get('/', getAllMembers); 
router.put('/:id/status', updateStatus); 

module.exports = router;
