const apiKey = process.env.GROK_AI_API;
async function testGroq() {
  console.log('🔄 Sending test message to Groq Llama 3 API...');

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are a warm, active listener. Reply to this with exactly 1 sentence.'
          },
          {
            role: 'user',
            content: 'I am so stressed about my exams tomorrow.'
          }
        ],
        temperature: 0.7,
        max_tokens: 150
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error('❌ API Error:', data.error.message);
    } else {
      console.log('✅ GROQ API SUCCESS!');
      console.log('🧠 AI Reply:', data.choices[0].message.content);
    }
  } catch (err) {
    console.error('❌ Fetch failed:', err.message);
  }
}

testGroq();
