const express = require('express');
const router = express.Router();
const patientController = require('../app/controllers/PatientController');
router.get('/:id', patientController.show);
router.put('/:id', patientController.update);
router.delete('/:id', patientController.delete);
router.get('/', patientController.index);
router.post('/', patientController.create);
module.exports = router;
