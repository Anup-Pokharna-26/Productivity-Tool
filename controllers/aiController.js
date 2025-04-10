const aiModel = require('../models/schema/ai.model');
const Task = require('../models/schema/task.model');
const generateAiResponse = require('../services/gemini');
const { SKILL_LEVEL_MAP } = require('../constants');

const aiController = {

  // 🚀 1. Generate AI Roadmap

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

  // ✅ 2. Confirm & Save AI + Tasks
  confirmRoadmap: async (req, res) => {
    try {
      const { userId, data } = req.body;

      if (!userId || !data) {
        return res.status(400).json({
          message: 'Missing required fields',
          required: ['userId', 'data']
        });
      }

      const requiredFields = ['title', 'skillLevel', 'monthsAllocated', 'hoursPerDay', 'aiResponse'];
      const missingFields = requiredFields.filter(field => data[field] === undefined);

      if (missingFields.length > 0) {
        return res.status(400).json({
          message: 'Missing required fields in data',
          missing: missingFields
        });
      }

      // Save AI Roadmap
      const newAiModel = new aiModel({
        title: data.title,
        userId,
        createdBy: userId,
        updatedBy: userId,
        skillLevel: data.skillLevel,
        monthsAllocated: data.monthsAllocated,
        hoursPerDay: data.hoursPerDay,
        aiResponse: data.aiResponse
      });

      const savedAiModel = await newAiModel.save();

      // 🧠 Save AI Tasks from aiResponse
      const roadmap = data.aiResponse.roadmap || {};

      for (const date in roadmap) {
        const tasks = roadmap[date];

        if (Array.isArray(tasks)) {
          for (const taskTitle of tasks) {
            const task = new Task({
              userId,
              title: taskTitle,
              description: "",
              taskDate: new Date(date.split("-").reverse().join("-")),
              category: "Ai",
              subCategory: data.title,
              createdBy: userId
            });
            await task.save();
          }
        } else {
          console.warn(`❗ Skipped invalid task list for date: ${date}`, tasks);
        }
      }

      res.status(201).json({
        message: 'Roadmap confirmed and tasks saved successfully',
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

  // 📥 3. Get All or One
  getAi: async (req, res) => {
    try {
      const { userId, roadmapId } = req.params;

      if (!userId) {
        return res.status(400).json({ message: 'userId is required' });
      }

      const query = roadmapId ? { userId, _id: roadmapId } : { userId };
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
      console.error('Error generating AI response:', err);
      res.status(500).json({ 
        message: 'Error generating AI response', 
        error: err.message 
      });
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

  // ❌ 5. Delete All Roadmaps of a User
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