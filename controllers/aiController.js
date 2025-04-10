const aiModel = require('../models/schema/ai.model');
const generateAiResponse = require('../services/gemini');
const { SKILL_LEVEL_MAP } = require('../constants');

const aiController = {
  /**
   * Generates a new learning roadmap using AI
   * @param {Object} req - Express request object
   * @param {Object} req.body - Request body containing:
   *   - title: string - The skill to learn
   *   - monthsAllocated: number - Number of months allocated
   *   - hoursPerDay: number - Hours per day available
   *   - startDate: string - Start date for the roadmap
   *   - skillLevel: number - Current skill level (0-4)
   * @param {Object} res - Express response object
   */
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

      if (skillLevel > SKILL_LEVEL_MAP.length) {
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
      
      // Add requred fields in the response 
      aiResponse.monthsAllocated = monthsAllocated;
      aiResponse.hoursPerDay = hoursPerDay;
      aiResponse.skillLevel = skillLevel;

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

  /**
   * Confirms and saves a roadmap to the database
   * @param {Object} req - Express request object
   * @param {Object} req.body - Request body containing:
   *   - userId: string - ID of the user
   *   - data: Object - Roadmap data containing:
   *     - title: string - The skill to learn
   *     - skillLevel: number - Current skill level
   *     - monthsAllocated: number - Number of months allocated
   *     - hoursPerDay: number - Hours per day available
   *     - aiResponse: Object - AI generated roadmap data
   * @param {Object} res - Express response object
   */
  confirmRoadmap: async (req, res) => {
    try {
      const { userId, data } = req.body;

      // Validate required fields
      if (!userId || !data) {
        return res.status(400).json({
          message: 'Missing required fields',
          required: ['userId', 'data']
        });
      }

      // Validate data structure
      const requiredFields = ['title', 'skillLevel', 'monthsAllocated', 'hoursPerDay', 'plan'];
      const missingFields = requiredFields.filter(field => !data[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          message: 'Missing required fields in data',
          missing: missingFields
        });
      }

      // Validate numeric fields
      if (isNaN(data.skillLevel) || isNaN(data.monthsAllocated) || isNaN(data.hoursPerDay)) {
        return res.status(400).json({
          message: 'Invalid numeric values',
          details: {
            skillLevel: 'Must be a number',
            monthsAllocated: 'Must be a number',
            hoursPerDay: 'Must be a number'
          }
        });
      }

      // Create new AI model instance
      const newAiModel = new aiModel({
        title: data.title,
        userId: userId,
        createdBy: userId, // Using userId as createdBy
        updatedBy: userId, // Using userId as updatedBy
        skillLevel: data.skillLevel,
        monthsAllocated: data.monthsAllocated,
        hoursPerDay: data.hoursPerDay,
        aiResponse: data.plan
      });

      // Save to database
      const savedAiModel = await newAiModel.save();

      //TODO:  Loop over plan and save each day of this user in our database

      res.status(201).json({
        message: 'success',
        result: savedAiModel
      });
    } catch (err) {
      console.error('Error confirming roadmap:', err);
      res.status(500).json({ 
        message: 'Error confirming roadmap', 
        error: err.message 
      });
    }
  },

  /**
   * Retrieves roadmap(s) for a user
   * @param {Object} req - Express request object
   * @param {Object} req.params - URL parameters:
   *   - userId: string - ID of the user (required)
   *   - roadmapId: string - ID of specific roadmap (optional)
   * @param {Object} res - Express response object
   * 
   * Usage:
   * - GET /api/ai/:userId - Returns all roadmaps for the user
   * - GET /api/ai/:userId/:roadmapId - Returns specific roadmap for the user
   */
  getAi: async (req, res) => {
    try {
      const { userId, roadmapId } = req.params;

      if (!userId) {
        return res.status(400).json({ 
          message: 'userId is required',
          required: ['userId']
        });
      }

      // If roadmapId is provided, get specific roadmap, otherwise get all roadmaps for user
      const query = roadmapId 
        ? { userId, _id: roadmapId }
        : { userId };

      const ai = await aiModel.find(query);

      if (!ai || ai.length === 0) {
        return res.status(404).json({ 
          message: roadmapId ? 'Roadmap not found' : 'No roadmaps found for this user'
        });
      }

      res.status(200).json({
        message: 'Roadmap(s) retrieved successfully',
        result: ai
      });
    } catch (err) {
      console.error('Error fetching AI:', err);
      res.status(500).json({ 
        message: 'Error getting AI', 
        error: err.message 
      });
    }
  },

  /**
   * Updates an existing roadmap
   * @param {Object} req - Express request object
   * @param {Object} req.params - URL parameters:
   *   - id: string - ID of the roadmap to update
   * @param {Object} req.body - Request body containing update fields
   * @param {Object} res - Express response object
   */
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
      const { userId, roadmapId } = req.params;
      console.log(`Deleting plan ${roadmapId} of user : ${userId}`)
      const deleted = await aiModel.deleteOne({ userId: userId, _id: roadmapId });

      if (!deleted || deleted.deletedCount === 0) {
        return res.status(400).json({ message: 'AI plan not found or you are not authorized to delete this plan.' });
      }

      console.log("Delete AI plan")
      res.status(200).json({ message: 'AI plan deleted successfully' });
    } catch (err) {
      console.error('Error deleting AI:', err);
      res.status(500).json({ message: 'Error deleting AI', error: err.message });
    }
  }
};

module.exports = aiController;