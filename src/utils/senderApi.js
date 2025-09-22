// utils/senderApi.js
import fetch from "node-fetch";

const SENDER_API_BASE = "https://api.sender.net/api/v2";
const API_KEY = process.env.SENDER_API_KEY;

export function checkApiKey() {
  if (!API_KEY) {
    console.error("❌ Missing SENDER_API_KEY in environment variables");
    return false;
  }
  console.log("✅ SENDER_API_KEY loaded (starts with):", API_KEY.substring(0, 8));
  return true;
}

export async function listCampaigns({ page = 1, per_page = 50 } = {}) {
  const resp = await fetch(`${SENDER_API_BASE}/campaigns?page=${page}&per_page=${per_page}`, {
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!resp.ok) {
    throw new Error(`Sender API error: ${resp.status} - ${await resp.text()}`);
  }
  return resp.json();
}

export async function getCampaignDetails(campaignId) {
  const resp = await fetch(`${SENDER_API_BASE}/campaigns/${campaignId}`, {
    headers: { "Authorization": `Bearer ${API_KEY}` },
  });

  if (!resp.ok) {
    throw new Error(`Sender API error: ${resp.status} - ${await resp.text()}`);
  }
  return resp.json();
}
