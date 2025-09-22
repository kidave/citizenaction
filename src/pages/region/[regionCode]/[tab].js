// pages/ward/[regionCode]/[tab].js
import RegionLayout from "components/region/RegionLayout";
import { RegionProvider } from "context/RegionContext";
import Spinner from "components/shared/ui/Spinner";
import { useRouter } from "next/router";

export default function WardTabPage() {
  const router = useRouter();
  const { regionCode } = router.query;

  if (!regionCode) return <Spinner mode="fullscreen" />;

  return (
    <RegionProvider regionCode={regionCode}>
      <RegionLayout />
    </RegionProvider>
  );
}