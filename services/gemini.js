const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateAiResponse({ skill, months, hours, startDate }) {
  const prompt = `I want to learn ${skill} in ${months} months. I can give ${hours} hours per day. Is it possible here give me keyword as isFeasible having value True/False and give me resone for that also  ? If not how much time is required? If yes, create a plan excluding weekends starting from ${startDate} of what tasks I need to do every day. Return response in following format. JSON: {"date" : ["list of tasks"]}`;

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const result = await model.generateContent(prompt);
  const response = await result.response.text();

  console.log("AI Response:", response);
  return response;
}

module.exports = generateAiResponse;
