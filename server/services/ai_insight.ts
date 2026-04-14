import fetch from 'node-fetch';

export interface AIInsight {
  summary: string;
  topicCategory: string;
  riskLevel: 'low' | 'medium' | 'high';
  ageSegment: string;
}

export async function generateSessionInsight(messages: Record<string, unknown>[], ageGroupRaw: string): Promise<AIInsight> {
  const apiKey = process.env.GROK_AI_API || process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    console.error("Missing AI API Key for insights.");
    return {
      summary: "Manual review required: AI insights unavailable.",
      topicCategory: "Unclassified",
      riskLevel: "low",
      ageSegment: ageGroupRaw || "Unknown"
    };
  }

  // Segment Age Group
  const ageSegment = ageGroupRaw || "Unknown";
  // The UI sends "13-15", "16-18", "18-21", "21+"

  const conversationText = messages
    .map(m => `${m.role === 'user' ? 'Student' : 'AI Assistant'}: ${m.content}`)
    .join('\n');

  const systemPrompt = `You are a specialized mental health data analyst. 
  Your task is to analyze a conversation transcript and provide a structured JSON response.
  
  Possible Categories: Anxiety, Academic Stress, Family Issues, Relationships, Loneliness, Self-esteem, Other.
  Possible Risk Levels: low, medium, high.
  
  Return ONLY a JSON object with this structure:
  {
    "summary": "3-5 line concise summary capturing emotional state and core issue",
    "topicCategory": "One of the categories listed above",
    "riskLevel": "low/medium/high based on distress indicators"
  }`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze this conversation:\n\n${conversationText}` }
        ],
        temperature: 0.1, // Low temperature for consistent classification
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json() as Record<string, unknown>;
    const choices = data.choices as Array<{ message: { content: string } }>;
    const result = JSON.parse(choices?.[0]?.message?.content || "{}");

    return {
      summary: result.summary || "Summary generation failed.",
      topicCategory: result.topicCategory || "Other",
      riskLevel: result.riskLevel || "low",
      ageSegment: ageSegment
    };
  } catch (err) {
    console.error('AI Insight Error:', err);
    return {
      summary: "Technical error during AI processing.",
      topicCategory: "Other",
      riskLevel: "low",
      ageSegment: ageSegment
    };
  }
}
