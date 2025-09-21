// components/region/tabs/RegionNewsletterTab.js
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
        <div key={nl.id}>
          <h2>{nl.title}</h2>
          {nl.embed_html ? (
            <div dangerouslySetInnerHTML={{ __html: nl.embed_html }} />
          ) : (
            <a href={nl.newsletter_url} target="_blank" rel="noreferrer">
              View Newsletter
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
