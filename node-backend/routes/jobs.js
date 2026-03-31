const express = require('express');
const jobController = require('../controllers/jobController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', jobController.getAllJobs);
router.get('/search', jobController.searchJobs);
router.get('/:id', jobController.getJob);
router.post('/', auth, jobController.postJob);

module.exports = router;