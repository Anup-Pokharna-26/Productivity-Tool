const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateAiResponse({ skill, months, hours, startDate, skillLevel }) {
<<<<<<< HEAD
  const prompt = `I want to learn ${skillLevel} ${skill} in ${months} months. I can give ${hours} hours per day. Is it possible? Return JSON in the following format:

{
  "intro": "Motivational introduction message",
  "isFeasible": true/false,
  "reason": "Why or why not",
  "roadmap": {
    "dd-mm-yyyy": ["Task 1", "Task 2"]
  }
}

Start roadmap from ${startDate} and exclude weekends. Ensure the response is valid JSON with no extra characters.`;
=======
  const prompt = `I want to learn ${skillLevel} ${skill} in ${months} months. I can dedicate ${hours} hours per day. Starting from ${startDate}, is this goal achievable? Provide a precise plan, with deterministic tasks.
  Tasks should be based on no of hours provided per day. 
  Respond with: 
    - A key "isFeasible" with a value of true or false. 
    - A "reason" explaining why it is or isn't feasible. 
    - If not feasible, provide "estimatedMonths" – the minimum number of months required. 
    - If feasible, generate a daily learning plan (excluding weekends) starting from ${startDate} under key "plan", showing what tasks I need to complete each day. 
    - Response format should be a JSON object like : 
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
>>>>>>> fef10e7193a0e7eb328c52e895641192c0cdf08d

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  try {
<<<<<<< HEAD
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textContent = response.text() || "";

    // Remove markdown wrapping if present
    const cleanJson = textContent.replace(/```json\n?|```/g, "").trim();

    // Parse JSON
    const parsedResponse = JSON.parse(cleanJson);
    return parsedResponse;
  } catch (error) {
    console.error("Error generating AI response:", error);
    throw new Error("Failed to generate AI response: " + error.message);
=======
    console.log("Calling Gemini AI", prompt);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log("Response from Gemini AI", response);
    
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
>>>>>>> fef10e7193a0e7eb328c52e895641192c0cdf08d
  }
}

module.exports = generateAiResponse;



<<<<<<< HEAD
// const { GoogleGenerativeAI } = require("@google/generative-ai");
// require("dotenv").config();

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// async function generateAiResponse({ skill, months, hours, startDate, skillLevel }) {
//   const prompt = `I want to learn ${skillLevel} ${skill} in ${months} months. I can give ${hours} hours per day. Is it possible here give me keyword as isFeasible having value True/False and give me resone for that also  ? If not how much time is required? If yes, create a plan excluding weekends starting from ${startDate} of what tasks I need to do every day. Return response in following format. JSON: {"date" : ["list of tasks"]}`;

//   const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

//   try {
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
    
//     // Get the text content from the response structure
//     const textContent = response.text() || "";
    
//     // Remove the markdown code block markers if present
//     const cleanJson = textContent.replace(/```json\n|\n```/g, '');
    
//     // Parse the JSON response
//     const parsedResponse = JSON.parse(cleanJson);
//     return parsedResponse;
//   } catch (error) {
//     console.error('Error generating AI response:', error);
//     throw new Error('Failed to generate AI response: ' + error.message);
//   }
// }

// module.exports = generateAiResponse;
=======
>>>>>>> fef10e7193a0e7eb328c52e895641192c0cdf08d
