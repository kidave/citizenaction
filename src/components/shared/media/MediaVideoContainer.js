// components/shared/media/VideoContainer.js
export default function MediaVideoContainer({ videoUrl, title }) {
  if (!videoUrl) return null;

  return (
    <div style={{
      position: "relative",
      paddingBottom: "56.25%",
      height: 0,
      overflow: "hidden",
      borderRadius: "8px",
      margin: "15px 0",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
    }}>
      <iframe
        src={videoUrl}
        title={title || "Meeting Video"}
        allow="autoplay; encrypted-media"
        allowFullScreen
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%"
        }}
      />
    </div>
  );
}
