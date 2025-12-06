// server.js - This file runs on your secure server (e.g., Node.js, Vercel Function)
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

// Load API key from environment variables for security. Never hardcode secrets!
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS to allow requests from your frontend's domain (e.g., your GitHub Pages URL)
app.use(cors()); 
app.use(express.json());

app.post('/generate-worksheet', async (req, res) => {
  // Validate incoming user inputs on the server side (critical security practice)
  const { topic, grade, num, style } = req.body;
  if (!topic || !grade || !num || !style) {
    return res.status(400).send("Missing required worksheet parameters.");
  }

  const prompt = `
Create a ${style} worksheet about "${topic}" for grade ${grade}.
Include ${num} questions.
After the questions, add a section "Answer Key" with correct answers.
Label the student section "Name: ___________   Date: ___________".
Format clearly with numbered questions.
`.trim();

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // A fast and capable model
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3, // Lower temperature for factual, consistent worksheets
      max_tokens: 1500,
    });
    
    // Send only the generated text back to the client
    res.send(completion.choices[0].message.content);

  } catch (error) {
    console.error("OpenAI API Error:", error.message);
    res.status(500).send("Failed to generate worksheet from OpenAI.");
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running securely at http://localhost:${PORT}`);
});
