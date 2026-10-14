// Monokuro AI Study Assistant: Question & Answer Route
// Compliant with SPEC.md §6.5, §9.1, & PRIV-003

import { NextRequest, NextResponse } from 'next/server';
import { TranscriptSegment } from '@/types';

interface AnswerRequestBody {
  videoId?: string;
  question: string;
  segments: TranscriptSegment[];
  consentVersion?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AnswerRequestBody;
    const { question, segments, consentVersion } = body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    if (!consentVersion) {
      return NextResponse.json(
        { error: 'User consent required before processing transcript with AI' },
        { status: 403 }
      );
    }

    // Limit context segments to prevent payload abuse (max 100 segments or 25,000 characters)
    const boundedSegments = (segments || []).slice(0, 100);
    const contextText = boundedSegments
      .map((s) => `[${s.id}] (${s.startMs ? Math.floor(s.startMs / 1000) + 's' : 'no-time'}): ${s.text}`)
      .join('\n');

    const apiKey = process.env.AI_API_KEY;
    const provider = process.env.AI_PROVIDER || 'groq';
    const model = process.env.AI_MODEL || 'llama-3.3-70b-versatile';

    // If an external AI provider key is configured, call it
    if (apiKey && process.env.AI_ENABLED !== 'false') {
      try {
        const endpoint =
          provider === 'groq'
            ? 'https://api.groq.com/openai/v1/chat/completions'
            : 'https://api.openai.com/v1/chat/completions';

        const prompt = `You are Monokuro Study Assistant, an ultra-focused educational tutor. Answer the user's question accurately based STRICTLY on the video transcript excerpts provided below. 

Instructions:
1. Ground your answer in the transcript.
2. If citing timestamps, reference the segment time accurately.
3. If the answer cannot be found in the transcript, state clearly that the transcript does not contain this information.
4. Keep explanations concise, clear, and structured with markdown bullet points.

TRANSCRIPT EXCERPTS:
${contextText.slice(0, 25000)}

USER QUESTION:
${question.slice(0, 500)}`;

        const aiRes = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: 'You are Monokuro, an academic study assistant.' },
              { role: 'user', content: prompt },
            ],
            temperature: 0.3,
            max_tokens: 800,
          }),
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const content = aiData.choices?.[0]?.message?.content || 'No response generated.';
          return NextResponse.json({
            answer: content,
            sourceSegmentIds: boundedSegments.slice(0, 3).map((s) => s.id),
          });
        }
      } catch (externalErr) {
        console.warn('External AI call failed, falling back to local synthesizer:', externalErr);
      }
    }

    // Grounded Local Synthesis Fallback (Works offline & without external API keys)
    const lowerQ = question.toLowerCase();
    const matchedSegments = boundedSegments.filter((s) => {
      const words = lowerQ.split(/\s+/).filter((w) => w.length > 3);
      return words.some((w) => s.text.toLowerCase().includes(w));
    });

    const relevant = matchedSegments.length > 0 ? matchedSegments.slice(0, 4) : boundedSegments.slice(0, 3);
    const citations = relevant.map((s) => s.id);

    let synthesis = `### Insights for: "${question}"\n\n`;

    if (relevant.length > 0) {
      synthesis += `Based on the video transcript segments, here are the key findings:\n\n`;
      relevant.forEach((s) => {
        const timeSec = s.startMs ? Math.floor(s.startMs / 1000) : null;
        const timeBadge = timeSec !== null ? `*(${Math.floor(timeSec / 60)}:${(timeSec % 60).toString().padStart(2, '0')})* ` : '';
        synthesis += `- ${timeBadge}"${s.text}"\n`;
      });
      synthesis += `\n**Key Takeaway:** Focus on these core explanations as you review your notes. You can bookmark any of these timestamps to jump directly to this moment in the video.`;
    } else {
      synthesis += `No direct keyword match was found in the parsed transcript for this specific query. Review the full transcript or check other chapters.`;
    }

    return NextResponse.json({
      answer: synthesis,
      sourceSegmentIds: citations,
      isLocalSynthesis: true,
    });
  } catch (err) {
    console.error('AI answer error:', err);
    return NextResponse.json({ error: 'Failed to answer question' }, { status: 500 });
  }
}
