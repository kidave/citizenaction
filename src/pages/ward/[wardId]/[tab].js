// pages/ward/[wardId]/[tab].js
import WardLayout from "components/ward/WardLayout";
import { WardProvider } from "context/WardContext";
import Spinner from "components/shared/ui/Spinner";
import { useRouter } from "next/router";

export default function WardTabPage() {
  const router = useRouter();
  const { wardId } = router.query;

  if (!wardId) return <Spinner mode="fullscreen" />;

  return (
    <WardProvider wardId={wardId}>
      <WardLayout />
    </WardProvider>
  );
}