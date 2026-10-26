import Head from "next/head";
import TermsOfUse from "@/components/system/TermsOfUse";

export default function TermsPage() {
  return (
    <>
      <Head>
        <title>Terms of Use | Citizen Action</title>
        <meta
          name="description"
          content="Read the terms that govern use of the Citizen Action civic participation platform."
        />
        <meta name="robots" content="index,follow" />
      </Head>
      <div className="min-h-dvh bg-muted/30 px-4 py-12">
        <div className="mx-auto max-w-3xl rounded-xl border bg-background p-6 shadow-sm sm:p-10">
          <TermsOfUse />
        </div>
      </div>
    </>
  );
}
