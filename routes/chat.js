const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const { checkAuth, checkRole } = require('../middleware/auth');
const { db } = require('../index');

const openai = new OpenAI({
  apiKey: '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',
});

router.post('/query', checkAuth, checkRole('user'), async (req, res) => {
  const { message, sessionId } = req.body;

  try {
    const inventorySnapshot = await db.collection('inventory').get();
    const inventory = {};
    inventorySnapshot.forEach((doc) => {
      inventory[doc.id] = doc.data();
    });

    const prompt = `
      You are an AI customer support assistant for an e-commerce platform.
      Use this inventory data: ${JSON.stringify(inventory)}.
      Answer the user's query: "${message}".
      Provide accurate, concise, and friendly responses.
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150,
    });

    const reply = response.choices[0].message.content.trim();
    res.json({ reply, sessionId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process query' });
  }
});

module.exports = router;