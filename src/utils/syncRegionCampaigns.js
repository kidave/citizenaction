// utils/syncRegionCampaigns.js
import { listCampaigns, checkApiKey } from "./senderApi";
import { supabase } from "./supabaseClient";

function extractRegionCode(title) {
  if (!title) return "MMR";
  
  // Try to match region codes (like MMR, BLR, DEL, etc.)
  const regionMatch = title.match(/\b([A-Z]{3})\b/);
  if (regionMatch) return regionMatch[1];
  
  return "MMR"; // default
}

export async function syncRegionCampaigns() {
  if (!checkApiKey()) {
    console.error("❌ API key check failed");
    return;
  }

  try {
    let page = 1;
    let total = 0;
    let hasMore = true;

    while (hasMore) {
      console.log(`📄 Fetching page ${page}...`);
      
      const resp = await listCampaigns({ page, per_page: 50 });
      const campaigns = resp.data || [];

      if (!campaigns.length) {
        console.log("No more campaigns found");
        break;
      }

      for (const campaign of campaigns) {
        const regionCode = extractRegionCode(campaign.name || campaign.subject || "");
        const publicUrl = campaign.public_archive_url || null;
        const editorUrl = campaign.archive_link || null;
        
        let embedHtml = null;
        if (publicUrl) {
          embedHtml = `
            <iframe 
              src="${publicUrl}" 
              width="100%" 
              height="800" 
              style="border:none;"
              loading="lazy"
            ></iframe>
          `.trim();
        }

        const record = {
          sender_campaign_id: campaign.id.toString(),
          region_code: regionCode,
          title: campaign.name || campaign.subject || "Untitled Newsletter",
          newsletter_url: publicUrl,
          editor_url: editorUrl,
          embed_html: embedHtml,
          created_at: new Date().toISOString()
        };

        console.log(`📧 Processing: ${record.title} -> Region: ${regionCode}`);

        // Upsert with better error handling
        const { error } = await supabase
          .from("region_newsletter")
          .upsert(record, { 
            onConflict: 'sender_campaign_id',
            ignoreDuplicates: false
          });

        if (error) {
          console.error("❌ Upsert failed:", error.message);
        } else {
          total++;
          console.log("✅ Saved:", record.title);
        }
      }

      hasMore = campaigns.length === 50;
      page++;
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`🎉 Sync completed! Processed ${total} newsletters`);
    
  } catch (error) {
    console.error("❌ Sync failed:", error.message);
  }
}