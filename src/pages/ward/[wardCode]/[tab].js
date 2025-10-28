// pages/ward/[wardCode]/[tab].js
import WardLayout from "components/ward/WardLayout";
import { WardProvider } from "context/WardContext";
import Spinner from "components/shared/ui/Spinner";
import { useRouter } from "next/router";

export default function WardTabPage() {
  const router = useRouter();
  const { wardCode } = router.query;

  if (!wardCode) return <Spinner mode="fullscreen" />;

  return (
    <WardProvider wardCode={wardCode}>
      <WardLayout />
    </WardProvider>
  );
}