const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/roadmap/new', aiController.generateNewRoadmap);
router.post('/roadmap/confirm', aiController.confirmRoadmap);
router.get('/roadmap/get/:userId/:roadmapId', aiController.getAi);
router.put('/roadmap/update/:id', aiController.updateAi);
router.delete('/roadmap/delete/:id', aiController.deleteAi);

module.exports = router;
