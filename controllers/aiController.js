const aiModel = require('../models/schema/ai.model');
const generateAiResponse = require('../services/gemini');
const { SKILL_LEVEL_MAP } = require('../constants');

const aiController = {
  generateNewRoadmap: async (req, res) => {
    try {
      const {
        title,
        monthsAllocated,
        hoursPerDay,
        startDate,
        skillLevel
      } = req.body;

      // Input validation
      if (!title || !monthsAllocated || !hoursPerDay || !startDate || !skillLevel) {
        return res.status(400).json({
          message: 'Missing required fields',
          required: ['title', 'monthsAllocated', 'hoursPerDay', 'startDate', 'skillLevel']
        });
      }

      // Validate numeric fields
      if (isNaN(monthsAllocated) || isNaN(hoursPerDay)) {
        return res.status(400).json({
          message: 'Invalid numeric values',
          details: {
            monthsAllocated: 'Must be a number',
            hoursPerDay: 'Must be a number'
          }
        });
      }

      if (skillLevel> SKILL_LEVEL_MAP.length) {
        return res.status(400).json({
          message: 'Invalid skill level',
          details: {
            skillLevel: 'Must be a number'
          }
        });
      }

      // Get AI raw response
      const aiResponse = await generateAiResponse({
        skill: title,
        months: monthsAllocated,
        hours: hoursPerDay,
        startDate,
        skillLevel: SKILL_LEVEL_MAP[skillLevel]
      });

      console.log("🔍 Raw AI Response:\n", aiResponse);

      // Return the parsed AI response directly to the UI
      res.status(200).json({
        message: 'AI response generated successfully',
        result: aiResponse
      });
    } catch (err) {
      console.error('Error generating AI response:', err);
      res.status(500).json({ 
        message: 'Error generating AI response', 
        error: err.message 
      });
    }
  },

  confirmRoadmap: async (req, res) => {
    try {
      const { roadmapId, userId } = req.body;

    } catch (err) {
      console.error('Error confirming roadmap:', err);
      res.status(500).json({ message: 'Error confirming roadmap', error: err.message });
    }
  },
  
  
  
  getAi: async (req, res) => {
    try {
      const { id } = req.params;
      const ai = await aiModel.find({ userId: id });

      if (!ai || ai.length === 0) {
        return res.status(404).json({ message: 'AI not found' });
      }

      res.status(200).json(ai);
    } catch (err) {
      console.error('Error fetching AI:', err);
      res.status(500).json({ message: 'Error getting AI', error: err.message });
    }
  },

  updateAi: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        title,
        userId,
        createdBy,
        updatedBy,
        skillLevel,
        monthsAllocated,
        hoursPerDay,
        aiResponse
      } = req.body;

      const updatedAi = await aiModel.findByIdAndUpdate(
        id,
        {
          title,
          userId,
          createdBy,
          updatedBy,
          skillLevel,
          monthsAllocated,
          hoursPerDay,
          aiResponse
        },
        { new: true, runValidators: true }
      );

      if (!updatedAi) {
        return res.status(404).json({ message: 'AI not found' });
      }

      res.status(200).json({ message: 'AI updated successfully', data: updatedAi });
    } catch (err) {
      console.error('Error updating AI:', err);
      res.status(500).json({ message: 'Error updating AI', error: err.message });
    }
  },

  deleteAi: async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await aiModel.deleteMany({ userId: id });

      if (!deleted || deleted.deletedCount === 0) {
        return res.status(404).json({ message: 'AI not found' });
      }

      res.status(200).json({ message: 'AI deleted successfully' });
    } catch (err) {
      console.error('Error deleting AI:', err);
      res.status(500).json({ message: 'Error deleting AI', error: err.message });
    }
  }
};

module.exports = aiController;