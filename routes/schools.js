// routes/schools.js
const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const controller = require('../controllers/schoolsController');

// Add School
router.post(
  '/addSchool',
  [
    body('name').isString().trim().notEmpty().withMessage('name is required'),
    body('address').isString().trim().notEmpty().withMessage('address is required'),
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('latitude must be a valid number between -90 and 90'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('longitude must be a valid number between -180 and 180')
  ],
  controller.addSchool
);

// List Schools by proximity
router.get(
  '/listSchools',
  [
    query('lat').exists().withMessage('lat is required').isFloat({ min: -90, max: 90 }),
    query('lng').exists().withMessage('lng is required').isFloat({ min: -180, max: 180 })
  ],
  controller.listSchools
);

module.exports = router;
