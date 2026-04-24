import { ImageResponse } from "@vercel/og";
import { createServerSupabase } from "@/lib/supabase/server";

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response("Missing id", { status: 400 });
    }

    const supabase = createServerSupabase();

    const { data: post } = await supabase
      .from("feed_detail_view")
      .select("summary, details, attachments")
      .eq("id", id)
      .single();

    if (!post) {
      return new Response("Post not found", { status: 404 });
    }

    const title = post.summary || "Citizen Action";

    const description =
      (post.details || "").slice(0, 120) + "...";

    // Extract image
    let image = null;

    if (post.attachments) {
      const parsed =
        typeof post.attachments === "string"
          ? JSON.parse(post.attachments)
          : post.attachments;

      const img = parsed?.find((a) =>
        a.type?.startsWith("image")
      );

      image = img?.url;
    }

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 40,
            background: "#0f172a",
            color: "white",
          }}
        >
          {/* TOP */}
          <div style={{ fontSize: 22, opacity: 0.8 }}>
            Citizen Action
          </div>

          {/* CENTER */}
          <div>
            <div
              style={{
                fontSize: 48,
                fontWeight: "bold",
                lineHeight: 1.2,
              }}
            >
              {title}
            </div>

            <div
              style={{
                fontSize: 24,
                marginTop: 20,
                opacity: 0.8,
              }}
            >
              {description}
            </div>
          </div>

          {/* IMAGE */}
          {image && (
            <img
              src={image}
              width="100%"
              height="300"
              style={{
                objectFit: "cover",
                borderRadius: 16,
              }}
            />
          )}
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    return new Response("Error generating image", {
      status: 500,
    });
  }
}