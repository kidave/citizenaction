import useRegionNewsletters from "hooks/useRegionNewsletters";
import { useRegion } from "context/RegionContext";

export default function RegionNewsletterTab() {
  const { regionCode } = useRegion();
  const { newsletters, loading } = useRegionNewsletters(regionCode);

  if (loading) return <p>Loading newsletters...</p>;
  if (!newsletters.length) return <p>No newsletters available.</p>;

  return (
    <div>
      {newsletters.map((nl) => (
        <div
          key={nl.id}
          style={{
            marginBottom: "2rem",
            padding: "1rem",
            border: "1px solid #ddd",
            borderRadius: "8px",
            background: "#fafafa",
          }}
        >
          <h2>{nl.title}</h2>

          {nl.embed_html ? (
            // Embed only safe public URL
            <div dangerouslySetInnerHTML={{ __html: nl.embed_html }} />
          ) : nl.editor_url ? (
            // Fallback: internal/editor URL
            <div
              style={{
                marginTop: "1rem",
                padding: "0.5rem",
                background: "#f0f0f0",
                borderRadius: "4px",
              }}
            >
              <p style={{ margin: 0 }}>Cannot embed this newsletter. Click below to view:</p>
              <a
                href={nl.editor_url}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#0070f3", textDecoration: "underline" }}
              >
                Open Newsletter
              </a>
            </div>
          ) : (
            <span>No newsletter available</span>
          )}
        </div>
      ))}
    </div>
  );
}
