// utils/senderRegionSync.js
import { listCampaigns, getCampaignDetails } from "./senderApi";
import { supabase } from "./supabaseClient";

// Extract region code from campaign title
function extractRegionCode(title) {
  // Pattern: "MMR - Monthly Newsletter - June 2023"
  const match = title.match(/^([A-Za-z0-9_]+)\s*-/);
  return match ? match[1] : "MMR"; // Default to MMR if not specified
}

export async function syncRegionCampaigns() {
  let page = 1;
  let finished = false;

  while (!finished) {
    try {
      const campaignsResp = await listCampaigns({ page, per_page: 50 });
      const campaigns = campaignsResp.data || [];

      if (campaigns.length === 0) break;

      for (const campaign of campaigns) {
        const campaignId = campaign.id;
        const title = campaign.name || campaign.title || campaign.subject;
        const regionCode = extractRegionCode(title);
        
        // Skip if not MMR region
        if (regionCode !== "MMR") continue;

        let archiveUrl = campaign.public_archive_url || campaign.archive_link;
        let embedHtml = null;
        
        if (campaign.embed_html) {
          embedHtml = campaign.embed_html;
        } else if (archiveUrl) {
          embedHtml = `<iframe src="${archiveUrl}" width="100%" style="min-height:400px; border:none;"></iframe>`;
        }

        const newsletterRecord = {
          sender_campaign_id: campaignId.toString(),
          region_code: regionCode,
          title: title,
          embed_html: embedHtml,
          newsletter_url: archiveUrl,
          issue_date: campaign.sent_at || new Date().toISOString().split('T')[0],
        };

        // Upsert into region_newsletter table
        const { error } = await supabase
          .from("region_newsletter")
          .upsert(newsletterRecord, {
            onConflict: "sender_campaign_id"
          });

        if (error) {
          console.error("Error upserting newsletter:", error, newsletterRecord);
        }
      }

      if (campaigns.length < 50) {
        finished = true;
      } else {
        page += 1;
      }
    } catch (error) {
      console.error("Error in syncRegionCampaigns:", error);
      finished = true;
    }
  }

  console.log("Region newsletter sync completed");
}