import type { NextApiRequest, NextApiResponse } from 'next';

export interface OutletAnalysis {
  outlet: string;
  headline: string;
  lean: number;
  tone: string;
  factsIncluded: string[];
  factsOmitted: string[];
  loadedWords: string[];
  blindSpots: string[];
  summary: string;
}

export interface AnalyzeResponse {
  topic: string;
  outlets: OutletAnalysis[];
}

const PROMPT_TEMPLATE = (topic: string) => `You are a media bias analyst. Analyze how the following 5 news outlets would cover this topic: "${topic}"

The outlets are:
1. Fox News (right-leaning)
2. The Wall Street Journal (center-right)
3. NPR (center-left)
4. The New York Times (center-left to left)
5. The Guardian (left-leaning)

For each outlet, provide a realistic analysis of how they would frame, report, and emphasize this topic based on their known editorial biases and tendencies.

Return ONLY valid JSON (no markdown, no code blocks) with this exact structure:
{
  "outlets": [
    {
      "outlet": "Fox News",
      "headline": "A realistic headline this outlet might use",
      "lean": 0.85,
      "tone": "one of: Alarmed, Critical, Skeptical, Neutral, Supportive, Celebratory, Investigative",
      "factsIncluded": ["fact1 they would emphasize", "fact2 they would highlight"],
      "factsOmitted": ["fact1 they would downplay or ignore", "fact2 they would avoid"],
      "loadedWords": ["emotionally charged word or phrase used", "another loaded term"],
      "blindSpots": ["perspective or angle they consistently miss", "another blind spot"],
      "summary": "2-3 sentence summary of how this outlet would frame and present this story"
    },
    {
      "outlet": "The Wall Street Journal",
      "headline": "...",
      "lean": 0.65,
      "tone": "...",
      "factsIncluded": [],
      "factsOmitted": [],
      "loadedWords": [],
      "blindSpots": [],
      "summary": "..."
    },
    {
      "outlet": "NPR",
      "headline": "...",
      "lean": 0.4,
      "tone": "...",
      "factsIncluded": [],
      "factsOmitted": [],
      "loadedWords": [],
      "blindSpots": [],
      "summary": "..."
    },
    {
      "outlet": "The New York Times",
      "headline": "...",
      "lean": 0.3,
      "tone": "...",
      "factsIncluded": [],
      "factsOmitted": [],
      "loadedWords": [],
      "blindSpots": [],
      "summary": "..."
    },
    {
      "outlet": "The Guardian",
      "headline": "...",
      "lean": 0.15,
      "tone": "...",
      "factsIncluded": [],
      "factsOmitted": [],
      "loadedWords": [],
      "blindSpots": [],
      "summary": "..."
    }
  ]
}

The "lean" field is a number from 0 to 1 where 0 = far left, 0.5 = center, 1 = far right.
Be specific and realistic. The headlines, facts, and loaded words should feel authentic to each outlet's actual style.`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic, apiKey } = req.body;

  if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  const key = apiKey || process.env.GROQ_API_KEY;
  if (!key) {
    return res.status(400).json({ error: 'Groq API key is required. Please add it in Settings.' });
  }

  try {
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'user',
              content: PROMPT_TEMPLATE(topic.trim()),
            },
          ],
          temperature: 0.7,
          max_tokens: 4096,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = (errorData as any)?.error?.message || `Groq API error: ${response.status}`;
      return res.status(response.status).json({ error: message });
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      return res.status(500).json({ error: 'No response from Groq API' });
    }

    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed.outlets || !Array.isArray(parsed.outlets)) {
      return res.status(500).json({ error: 'Invalid response format from Groq API' });
    }

    return res.status(200).json({ topic: topic.trim(), outlets: parsed.outlets } as AnalyzeResponse);
  } catch (err: any) {
    if (err instanceof SyntaxError) {
      return res.status(500).json({ error: 'Failed to parse Groq response as JSON' });
    }
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
