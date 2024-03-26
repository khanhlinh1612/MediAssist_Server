const express = require('express');
const router = express.Router();
const medicalRecordController = require('../app/controllers/MedicalRecordController');
router.get('/:id', medicalRecordController.show);
router.put('/:id', medicalRecordController.update);
router.delete('/:id', medicalRecordController.delete);
router.get('/', medicalRecordController.index);
router.post('/', medicalRecordController.create);
module.exports = router;
