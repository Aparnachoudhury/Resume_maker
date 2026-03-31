const express = require('express');
const matchController = require('../controllers/matchController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/jobs', auth, matchController.getMatchedJobs);
router.get('/skill-gap/:jobId', auth, matchController.getSkillGap);

module.exports = router;