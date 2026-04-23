const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  searchItems
} = require('../controllers/itemController');

router.route('/')
  .post(protect, createItem)
  .get(getItems);

router.get('/search', searchItems);

router.route('/:id')
  .get(getItemById)
  .put(protect, updateItem)
  .delete(protect, deleteItem);

module.exports = router;