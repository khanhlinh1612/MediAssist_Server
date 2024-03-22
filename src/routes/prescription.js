const express = require('express');
const router = express.Router();
const prescriptionController = require('../app/controllers/PrescriptionController');
router.get('/:id', prescriptionController.show);
router.put('/:id', prescriptionController.update);
router.delete('/:id', prescriptionController.delete);
router.get('/', prescriptionController.index);
router.post('/', prescriptionController.create);
module.exports = router;
