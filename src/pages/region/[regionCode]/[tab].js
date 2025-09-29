// pages/region/[regionCode]/[tab].js (NOT ward!)
import RegionLayout from "components/region/RegionLayout";
import { RegionProvider } from "context/RegionContext";
import Spinner from "components/shared/ui/Spinner";
import { useRouter } from "next/router";

export default function RegionTabPage() {
  const router = useRouter();
  const { regionCode } = router.query;

  if (!regionCode) return <Spinner mode="fullscreen" />;

  return (
    <RegionProvider regionCode={regionCode}>
      <RegionLayout />
    </RegionProvider>
  );
}