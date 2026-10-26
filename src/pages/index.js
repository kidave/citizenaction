import Head from "next/head";
import Link from "next/link";
import Feed from "@/components/feed/Feed";
import AppShell from "@/components/layout/AppShell";

export default function Home() {
  return (
    <>
      <Head>
        <title key="title">Citizen Action | Civic Documentation &amp; Participation</title>
        <meta
          name="description"
          content="Citizen Action helps people document civic initiatives, share useful information, and explore public organizations, governance and geographic context."
        />
      </Head>

      <section
        aria-labelledby="home-intro-title"
        className="mx-auto mb-5 w-full max-w-[720px] border-b px-4 pb-5 pt-2 sm:px-0"
      >
        <h1 id="home-intro-title" className="text-xl font-semibold tracking-tight">
          Citizen Action
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
          A civic documentation and participation platform developed under the
          Mumbai Sustainability Center. Discover community initiatives, share
          updates and resources, and explore public organizations, governance
          positions, appointments and geographic information.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Learn more <Link href="/about" className="underline underline-offset-4 hover:text-foreground">about Citizen Action</Link>
          {" "}or read our <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">Privacy Policy</Link>.
        </p>
      </section>

      <Feed />
    </>
  );
}

Home.getLayout = (page) => <AppShell showRightSidebar>{page}</AppShell>;
