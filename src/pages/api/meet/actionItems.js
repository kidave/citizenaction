// pages/api/generateActionItems.js
import { supabase } from "@/utils/supabaseClient";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  try {
    const { meetingId } = req.query;
    if (!meetingId) return res.status(400).json({ error: "Missing meetingId" });

    // Fetch transcript from Supabase
    const { data: meeting, error } = await supabase
      .from("region_meeting")
      .select("id, transcript")
      .eq("id", meetingId)
      .single();
    if (error || !meeting) return res.status(404).json({ error: "Meeting not found" });

    const prompt = `
You are an assistant that converts meeting transcripts into structured action items.

Transcript:
${meeting.transcript}

Format the output as JSON grouped by participant name. 
Use "General" for items not specific to any person.
Example:
{
  "Mathew": ["Task 1", "Task 2"],
  "Rishi": ["Task 1", "Task 2"],
  "General": ["Shared task"]
}
`;

    let response;

    // Try GPT-4 first
    try {
      response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 1000,
      });
    } catch (err) {
      console.warn("GPT-4 failed, falling back to GPT-3.5:", err.message);
      // Fallback to GPT-3.5
      response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 1000,
      });
    }

    // Parse LLM output safely
    let actionItems;
    try {
      const text = response.choices[0].message.content.trim();
      const cleaned = text.replace(/^```json\s*|\s*```$/g, '');
      actionItems = JSON.parse(cleaned);
    } catch (e) {
      return res.status(500).json({
        error: "Failed to parse LLM output",
        raw: response.choices[0].message.content,
      });
    }

    // Save action items back to Supabase
    await supabase
      .from("region_meeting")
      .update({ action_items: actionItems })
      .eq("id", meeting.id);

    res.status(200).json({ actionItems });
  } catch (err) {
    console.error("Error generating action items:", err);
    res.status(500).json({ error: err.message });
  }
}
