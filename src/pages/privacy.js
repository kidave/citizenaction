import Head from "next/head";
import PrivacyPolicy from "@/components/system/PrivacyPolicy";

export default function PrivacyPage() {
  return (
    <>
      <Head>
        <title key="title">Privacy Policy | Citizen Action</title>
        <meta
          name="description"
          content="Learn what information Citizen Action handles, how it is used, when it may be shared, and how to make a privacy request."
        />
        <meta name="robots" content="index,follow" />
      </Head>
      <div className="min-h-dvh bg-muted/30 px-4 py-12">
        <div className="mx-auto max-w-3xl rounded-xl border bg-background p-6 shadow-sm sm:p-10">
          <PrivacyPolicy />
        </div>
      </div>
    </>
  );
}
