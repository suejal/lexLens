const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const API_KEY = process.env.ROUTEWAY_API_KEY;

async function testRouteway(mode) {
  try {
    const text = mode === 'small' ? 'Say hello' : 'A'.repeat(80000);
    const msgs = [
      { role: 'system', content: 'You are a bot. Reply valid JSON.' },
      { role: 'user', content: text }
    ];
    console.log(`[${mode}] Sending request (approx ${text.length} chars)...`);
    const response = await axios.post(
      'https://api.routeway.ai/v1/chat/completions',
      {
        model: 'glm-4.5-air:free',
        messages: msgs,
        temperature: 0.1,
        max_tokens: 50,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );
    console.log(`[${mode}] SUCCESS:`, response.status);
    console.log(`[${mode}] DATA:`, typeof response.data === 'string' ? response.data.substring(0, 100) : response.data);
  } catch (err) {
    if (err.response) {
      console.log(`[${mode}] HTTP ERROR \${err.response.status}:`, err.response.data);
    } else {
      console.log(`[${mode}] NETWORK ERROR:`, err.message);
    }
  }
}

async function run() {
  await testRouteway('small');
  await testRouteway('large');
}

run();
