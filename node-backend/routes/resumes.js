const express = require('express');
const resumeController = require('../controllers/resumeController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/upload', auth, resumeController.uploadResume);
router.get('/my-resume', auth, resumeController.getResume);

module.exports = router;