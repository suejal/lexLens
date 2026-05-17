const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

async function testRouteway() {
  try {
    const response = await axios.post(
      'https://api.routeway.ai/v1/chat/completions',
      {
        model: 'glm-4.5-air:free',
        messages: [
          { role: 'system', content: 'You are a bot.' },
          { role: 'user', content: 'Say hello' }
        ],
        temperature: 0.1,
        max_tokens: 50
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.ROUTEWAY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('STATUS:', response.status);
    console.log('DATA:', JSON.stringify(response.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.log('HTTP ERROR STATUS:', err.response.status);
      console.log('HTTP ERROR DATA:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.log('NETWORK ERROR:', err.message);
    }
  }
}
testRouteway();
