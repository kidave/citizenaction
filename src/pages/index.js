import Feed from "@/components/feed/Feed";
import AppShell from "@/components/layout/AppShell";

export default function Home() {
  return <Feed />;
}

Home.getLayout = (page) => <AppShell showRightSidebar>{page}</AppShell>;
