const express = require('express');
const router = express.Router();
const parser = require('../util/parser');
const postsController = require('../app/controllers/PostsController');
router.get('/:id', postsController.show);
router.put('/:id', parser.single('file'), postsController.update);
router.delete('/:id', postsController.delete);
router.get('/', postsController.index);
router.post('/', parser.single('file'), postsController.create);
module.exports = router;
