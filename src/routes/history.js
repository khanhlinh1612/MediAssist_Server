const express = require('express');
const router = express.Router();
const historyController = require('../app/controllers/HistoryController');
router.get('/:id', historyController.show);
router.put('/:id', historyController.update);
router.delete('/:id', historyController.delete);
router.get('/', historyController.index);
router.post('/', historyController.create);
module.exports = router;
