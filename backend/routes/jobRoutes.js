const express = require('express');
const router = express.Router();
const {
  uploadJobDocument,
  createJob,
  getJobs,
  getJobById,
  matchJobWithResume,
  deleteJob
} = require('../controllers/jobController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.post('/upload', upload.single('jobFile'), uploadJobDocument);
router.post('/', createJob);
router.get('/', getJobs);
router.get('/:id', getJobById);
router.post('/:id/match', matchJobWithResume);
router.delete('/:id', deleteJob);

module.exports = router;

