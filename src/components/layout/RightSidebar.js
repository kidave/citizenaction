import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
  FiInstagram,
  FiLinkedin,
  FiGlobe,
  FaFacebook,
  FaYoutube,
  FaGithub,
} from "react-icons/fi";

import { FaBluesky, FaXTwitter } from "react-icons/fa6";

export default function RightSidebar() {
  return (
    <aside className="sticky space-y-4 py-4">
      {/* ABOUT */}
      <Card className="space-y-2 p-4 text-sm">
        <p className="font-semibold">Citizen Action</p>
        <p className="leading-relaxed text-muted-foreground">
          A civic participation platform by the <b> Walking Project </b> under{" "}
          <b>Mumbai Sustainability Center</b>, focused on walkability,
          governance, and local action.
        </p>
      </Card>

      {/* SOCIAL */}
      <Card className="p-4">
        <p className="mb-3 text-sm font-medium">Connect</p>
        <div className="flex items-center gap-4 text-muted-foreground">
          <Link
            href="https://x.com"
            target="_blank"
            aria-label="X (formerly Twitter)"
            className="hover:text-foreground"
          >
            <FaXTwitter size={18} />
          </Link>

          <Link
            href="https://instagram.com"
            target="_blank"
            aria-label="Instagram"
            className="hover:text-foreground"
          >
            <FiInstagram size={18} />
          </Link>

          <Link
            href="https://linkedin.com"
            target="_blank"
            aria-label="LinkedIn"
            className="hover:text-foreground"
          >
            <FiLinkedin size={18} />
          </Link>

          <Link
            href="https://citizenaction.in"
            target="_blank"
            aria-label="Website"
            className="hover:text-foreground"
          >
            <FiGlobe size={18} />
          </Link>
        </div>
      </Card>

      {/* LEGAL */}
      <Card className="space-y-2 p-4 text-xs text-muted-foreground">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <Link href="/about" className="hover:underline">
            About
          </Link>
          <Link href="/auth/privacy" className="hover:underline">
            Privacy
          </Link>
          <Link href="/auth/privacy" className="hover:underline">
            Terms
          </Link>
          <Link href="/contact" className="hover:underline">
            Contact
          </Link>
        </div>

        <p className="pt-2 leading-snug">
          © {new Date().getFullYear()} Mumbai Sustainability Center
        </p>
      </Card>
    </aside>
  );
}
