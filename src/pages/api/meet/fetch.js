// pages/api/meet/fetch.js
import { google } from "googleapis";
import { getMeetRecordings, getMeetTranscripts } from "@/lib/googleMeet";
import { supabase } from "@/utils/supabaseClient";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  try {
    const { conferenceRecordId, regionCode, meetingDate } = req.query;

    if (!conferenceRecordId || !regionCode || !meetingDate) {
      return res.status(400).json({ error: "conferenceRecordId, regionCode, and meetingDate are required" });
    }

    // Google auth
    const auth = new google.auth.GoogleAuth({
      keyFile: "service-account.json", // or use env var
      scopes: ["https://www.googleapis.com/auth/meet.recordings.readonly"],
    });

    // 1️⃣ Fetch recordings
    const recordings = await getMeetRecordings(auth, conferenceRecordId);
    const firstRecording = recordings[0];

    // 2️⃣ Fetch transcripts
    const meet = google.meet({ version: "v2", auth });
    const transcriptsList = await meet.conferenceRecords.transcripts.list({
      parent: `conferenceRecords/${conferenceRecordId}`,
    });

    let transcriptEntries = [];
    for (const t of transcriptsList.data.transcripts || []) {
      const entries = await getMeetTranscripts(auth, conferenceRecordId, t.name.split("/").pop());
      transcriptEntries.push(...entries);
    }

    // Build raw transcript text
    const transcriptText = transcriptEntries.map(e => `${e.speaker || "Unknown"}: ${e.text}`).join("\n");

    // 3️⃣ Generate structured data with OpenAI
    const prompt = `
You are a meeting assistant. Given the transcript, extract:

1. Meeting title (if not explicitly given)
2. Concise summary (2–3 sentences)
3. Action items grouped by participant ("General" for shared)

Transcript:
${transcriptText}

Output JSON format:
{
  "title": "...",
  "summary": "...",
  "action_items": {
    "Mathew": ["Task 1", "Task 2"],
    "General": ["Shared task"]
  }
}
`;

    let response;
    try {
      response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 1000,
      });
    } catch (err) {
      console.warn("GPT-4 failed, falling back to GPT-3.5:", err.message);
      response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 1000,
      });
    }

    let structuredData;
    try {
      const text = response.choices[0].message.content.trim();
      const cleaned = text.replace(/^```json\s*|\s*```$/g, '');
      structuredData = JSON.parse(cleaned);
    } catch (e) {
      return res.status(500).json({ error: "Failed to parse LLM output", raw: response.choices[0].message.content });
    }

    // 4️⃣ Save in Supabase
    const { data, error } = await supabase.from("region_meeting").insert({
      region_code: regionCode,
      title: structuredData.title,
      summary: structuredData.summary,
      meeting_date: meetingDate,
      meet_link: firstRecording?.driveDestination?.driveFile?.uri || null,
      recording_url: firstRecording?.driveDestination?.driveFile?.id || null,
      transcript: transcriptText,
      transcript_json: transcriptEntries,
      attendees: [...new Set(transcriptEntries.map(e => e.speaker).filter(Boolean))],
      action_items: structuredData.action_items,
      processed: true,
    }).select().single();

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json({ meeting: data });
  } catch (err) {
    console.error("Meet API error:", err);
    res.status(500).json({ error: err.message });
  }
}
