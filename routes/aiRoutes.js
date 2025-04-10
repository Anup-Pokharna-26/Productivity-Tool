    const express = require('express');
    const router = express.Router();
    const aiController = require('../controllers/aiController');

<<<<<<< HEAD
    router.post('/roadmap/new', aiController.generateNewRoadmap);
    router.post('/roadmap/confirm', aiController.confirmRoadmap);
    router.get('/roadmap/get/:userId/:roadmapId', aiController.getAi);
    router.put('/roadmap/update/:id', aiController.updateAi);
    router.delete('/roadmap/delete/:id', aiController.deleteAi);
=======
router.post('/roadmap/new', aiController.generateNewRoadmap);
router.post('/roadmap/confirm', aiController.confirmRoadmap);
router.get('/roadmap/get/:userId', aiController.getAi);
router.get('/roadmap/get/:userId/:roadmapId', aiController.getAi);
router.put('/roadmap/update/:id', aiController.updateAi);
router.delete('/roadmap/delete/:userId/:roadmapId', aiController.deleteAi);
>>>>>>> fef10e7193a0e7eb328c52e895641192c0cdf08d

    module.exports = router;