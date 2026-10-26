export async function getServerSideProps() {
  return {
    redirect: {
      destination: "/privacy",
      permanent: true,
    },
  };
}

export default function LegacyPrivacyRedirect() {
  return null;
}
