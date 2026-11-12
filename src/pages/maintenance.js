export default function Maintenance() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontFamily: "sans-serif",
        backgroundColor: "#fafafa",
        color: "#333",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
        🛠️ Under Maintenance
      </h1>
      <p
        style={{
          fontSize: "1.2rem",
          color: "#666",
          textAlign: "center",
          maxWidth: "500px",
          lineHeight: "1.5",
        }}
      >
        We are currently upgrading our servers and making improvements to our
        frontend and backend. We will be back online shortly!
      </p>
    </div>
  );
}
