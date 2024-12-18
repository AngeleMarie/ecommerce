const express = require('express');
const { addItem, getAllItems, getItemById, deleteItem } = require('../controllers/shoppingController');

const router = express.Router();

router.post('/add', addItem);
router.get('/', getAllItems);
router.get('/:id', getItemById);
router.delete('/:id', deleteItem);

module.exports = router;
