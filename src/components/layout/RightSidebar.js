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
    <aside className="sticky mx-auto px-4 py-6 space-y-6">
      {/* ABOUT */}
      <Card className="p-4 text-sm space-y-2">
        <p className="font-semibold">Citizen Action</p>
        <p className="text-muted-foreground leading-relaxed">
          A civic participation platform by the{" "}
          <b> Walking Project </b>
          {' '}under{' '}
          <b>Mumbai Sustainability Center</b>
          , focused on walkability, governance, and local action.
        </p>
      </Card>

      {/* SOCIAL */}
      <Card className="p-4">
        <p className="text-sm font-medium mb-3">Connect</p>
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
      <Card className="p-4 text-xs text-muted-foreground space-y-2">
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
