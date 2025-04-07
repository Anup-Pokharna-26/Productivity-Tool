const aiModel = require('../models/schema/ai.model');
const generateAiResponse = require('../services/gemini');

const aiController = {
  createAi: async (req, res) => {
    try {
      const {
        title,
        userId,
        createdBy,
        updatedBy,
        skillLevel,
        monthsAllocated,
        hoursPerDay,
        startDate,
        skill
      } = req.body;
  
      // Get AI raw response
      const aiRaw = await generateAiResponse({
        skill,
        months: monthsAllocated,
        hours: hoursPerDay,
        startDate
      });
  
      console.log("🔍 Raw AI Response:\n", aiRaw);
  
      // Try to extract a valid JSON object with balanced brackets
      const jsonStart = aiRaw.indexOf('{');
      const jsonEnd = aiRaw.lastIndexOf('}');
      const jsonString = aiRaw.slice(jsonStart, jsonEnd + 1);
  
      // Attempt to fix common issues before parsing
      const cleanedJson = jsonString
        .replace(/,\s*}/g, '}') // Remove trailing commas before object ends
        .replace(/,\s*]/g, ']'); // Remove trailing commas before array ends
  
      let parsedJson;
      try {
        parsedJson = JSON.parse(cleanedJson);
      } catch (parseError) {
        console.error("❌ Still invalid JSON:", parseError.message);
        return res.status(500).json({
          message: 'AI response is not valid JSON after cleanup.',
          error: parseError.message,
          raw: cleanedJson
        });
      }
  
      const newAi = new aiModel({
        title,
        userId,
        createdBy,
        updatedBy,
        skillLevel,
        monthsAllocated,
        hoursPerDay,
        aiResponse: parsedJson
      });
  
      await newAi.save();
      res.status(201).json({ message: 'AI created successfully', data: newAi });
    } catch (err) {
      console.error('Error creating AI:', err);
      res.status(500).json({ message: 'Error creating AI', error: err.message });
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
