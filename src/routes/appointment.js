const express = require('express');
const router = express.Router();
const appointmentsController = require('../app/controllers/AppointmentController');
router.get('/:id', appointmentsController.show);
router.put('/:id', appointmentsController.update);
router.delete('/:id', appointmentsController.delete);
router.get('/', appointmentsController.index);
router.post('/', appointmentsController.create);
module.exports = router;
