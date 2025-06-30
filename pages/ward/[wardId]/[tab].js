// pages/ward/[wardId]/[tab].js
import WardLayout from '../../../components/ward/WardLayout';

export default function WardTabPage() {
  // This page now simply renders the layout.
  // The layout itself reads the wardId and tab from the router.
  return <WardLayout />;
}