// Monokuro AI Study Assistant: Summarize Route
// Compliant with SPEC.md §6.5 & §9.1

import { NextRequest, NextResponse } from 'next/server';
import { TranscriptSegment } from '@/types';

interface SummarizeRequestBody {
  videoId?: string;
  segments: TranscriptSegment[];
  consentVersion?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SummarizeRequestBody;
    const { segments, consentVersion } = body;

    if (!consentVersion) {
      return NextResponse.json(
        { error: 'User consent required before processing transcript with AI' },
        { status: 403 }
      );
    }

    if (!segments || segments.length === 0) {
      return NextResponse.json({ error: 'No transcript segments to summarize' }, { status: 400 });
    }

    const boundedSegments = segments.slice(0, 100);
    const contextText = boundedSegments
      .map((s) => `[${s.id}] (${s.startMs ? Math.floor(s.startMs / 1000) + 's' : 'no-time'}): ${s.text}`)
      .join('\n');

    const apiKey = process.env.AI_API_KEY;
    const provider = process.env.AI_PROVIDER || 'groq';
    const model = process.env.AI_MODEL || 'llama-3.3-70b-versatile';

    if (apiKey && process.env.AI_ENABLED !== 'false') {
      try {
        const endpoint =
          provider === 'groq'
            ? 'https://api.groq.com/openai/v1/chat/completions'
            : 'https://api.openai.com/v1/chat/completions';

        const prompt = `You are Monokuro Study Assistant. Summarize this academic video transcript clearly and concisely.

Structure:
1. **Executive Summary** (2-3 sentences)
2. **Core Concepts & Key Points** (bullet points with timestamps if available)
3. **Actionable Study Questions** for self-testing

TRANSCRIPT:
${contextText.slice(0, 25000)}`;

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
            max_tokens: 1000,
          }),
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const content = aiData.choices?.[0]?.message?.content || 'No summary generated.';
          return NextResponse.json({
            summary: content,
            sourceSegmentIds: boundedSegments.slice(0, 5).map((s) => s.id),
          });
        }
      } catch (externalErr) {
        console.warn('External AI call failed, using local summarizer:', externalErr);
      }
    }

    // Local Grounded Extractive Summary
    const totalSegments = boundedSegments.length;
    const sampleSegments = [
      boundedSegments[0],
      boundedSegments[Math.floor(totalSegments * 0.25)],
      boundedSegments[Math.floor(totalSegments * 0.5)],
      boundedSegments[Math.floor(totalSegments * 0.75)],
      boundedSegments[totalSegments - 1],
    ].filter(Boolean);

    let summary = `## Study Workspace Summary\n\n`;
    summary += `### Overview\nThis session contains ${boundedSegments.length} parsed transcript cues across the lecture timeline.\n\n`;
    summary += `### Key Highlights & Segments\n`;

    sampleSegments.forEach((s) => {
      const timeSec = s.startMs ? Math.floor(s.startMs / 1000) : null;
      const timeBadge = timeSec !== null ? `**[${Math.floor(timeSec / 60)}:${(timeSec % 60).toString().padStart(2, '0')}]** ` : '';
      summary += `- ${timeBadge}${s.text}\n`;
    });

    summary += `\n### Recommendations for Review\n- Convert important timeline marks into bookmarks.\n- Test your recall using the Notes panel on the right.\n- Use the search bar to filter specific terminology in the transcript.`;

    return NextResponse.json({
      summary,
      sourceSegmentIds: sampleSegments.map((s) => s.id),
      isLocalSynthesis: true,
    });
  } catch (err) {
    console.error('AI summarize error:', err);
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}
