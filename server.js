// server.js - run on your secure server (Node.js)
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();
const PORT = process.env.PORT || 3000;

// Load API key from environment variables for security. Never hardcode secrets!
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors()); // restrict origin in production, e.g. cors({ origin: 'https://your-site.example' })
app.use(express.json());

app.post('/generate-worksheet', async (req, res) => {
  try {
    const { topic, grade, num, style } = req.body;
    if (!topic || !grade || !num || !style) {
      return res.status(400).json({ error: 'Missing required worksheet parameters.' });
    }

    const prompt = `
Create a ${style} worksheet about "${topic}" for grade ${grade}.
Include ${num} questions.
Label the student section "Name: ___________   Date: ___________".
Format clearly with numbered questions.
`.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const text = completion.choices?.[0]?.message?.content;
    if (!text) return res.status(500).json({ error: 'OpenAI returned no content.' });

    // Return generated text to the client
    res.json({ text });
  } catch (error) {
    console.error("OpenAI API Error:", error);
    res.status(500).json({ error: 'Failed to generate worksheet from OpenAI.' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});
