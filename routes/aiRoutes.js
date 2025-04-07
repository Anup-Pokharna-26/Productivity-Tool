const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/create', aiController.createAi);
router.get('/get/:id', aiController.getAi);
router.put('/update/:id', aiController.updateAi);
router.delete('/delete/:id', aiController.deleteAi);

module.exports = router;
