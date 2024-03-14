const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });
const postsController = require('../app/controllers/PostsController');
router.get('/:id', postsController.show);
router.put('/:id', uploadMiddleware.single('file'), postsController.update);
router.delete('/:id', postsController.delete);
router.get('/', postsController.index);
router.post('/', uploadMiddleware.single('file'), postsController.create);
module.exports = router;
