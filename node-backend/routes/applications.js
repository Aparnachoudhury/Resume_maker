const express = require('express');
const applicationController = require('../controllers/applicationController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, applicationController.applyForJob);
router.get('/', auth, applicationController.getApplications);
router.get('/recruiter/all', auth, applicationController.getApplicationsForRecruiter);
router.patch('/:applicationId/status', auth, applicationController.updateApplicationStatus);

module.exports = router;