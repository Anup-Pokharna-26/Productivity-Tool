const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateAiResponse({ skill, months, hours, startDate, skillLevel }) {
  const prompt = `I want to learn ${skillLevel} ${skill} in ${months} months. I can dedicate ${hours} hours per day. Starting from ${startDate}, is this goal achievable? Provide a precise plan, with deterministic tasks.
  Tasks should be based on number of hours provided per day.
  Respond with:
    - A key "isFeasible" with a value of true or false.
    - A "reason" explaining why it is or isn't feasible.
    - If not feasible, provide "estimatedMonths" – the minimum number of months required.
    - If feasible, generate a daily learning plan (excluding weekends) starting from ${startDate} under key "plan", showing what tasks I need to complete each day.
    - Response format should be a JSON object like:
    {
      "isFeasible": boolean,
      "reason": string,
      "title": string, // This will be title
      "plan": [
        {
          "date": string,
          "topic": string, // This will be topic
          "tasks": string[] // These are subtopics under the topic
        }
      ]
    }
  `;

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;

    const textContent = response.text() || "";

    // Remove markdown code block markers if present
    const cleanJson = textContent.replace(/```json\n?|```/g, "").trim();

    // Parse the cleaned JSON string
    const parsedResponse = JSON.parse(cleanJson);
    return parsedResponse;
  } catch (error) {
    console.error("Error generating AI response:", error);
    throw new Error("Failed to generate AI response: " + error.message);
  }
}

module.exports = generateAiResponse;
