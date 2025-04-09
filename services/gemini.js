const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateAiResponse({ skill, months, hours, startDate, skillLevel }) {
  const prompt = `I want to learn ${skillLevel} ${skill} in ${months} months. I can give ${hours} hours per day. Is it possible here give me keyword as isFeasible having value True/False and give me resone for that also  ? If not how much time is required? If yes, create a plan excluding weekends starting from ${startDate} of what tasks I need to do every day. Return response in following format. JSON: {"date" : ["list of tasks"]}`;

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Get the text content from the response structure
    const textContent = response.text() || "";
    
    // Remove the markdown code block markers if present
    const cleanJson = textContent.replace(/```json\n|\n```/g, '');
    
    // Parse the JSON response
    const parsedResponse = JSON.parse(cleanJson);
    return parsedResponse;
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw new Error('Failed to generate AI response: ' + error.message);
  }
}

module.exports = generateAiResponse;
