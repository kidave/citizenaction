import Link from "next/link";
import { FiInstagram, FiLinkedin, FiGlobe } from "react-icons/fi";
import { FaXTwitter } from "react-icons/fa6";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Moon, Sun, Laptop, Palette } from "lucide-react";
import { ThemeSwitcher } from "@/styles/ThemeSwitcher";

export default function RightSidebar() {
  return (
    <Sidebar side="right" className="border-l">
      <SidebarHeader className="border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Appearance</h2>
            <p className="text-xs text-muted-foreground">Theme preferences</p>
          </div>

          <ThemeSwitcher />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* About */}
        <SidebarGroup>
          <SidebarGroupLabel>About</SidebarGroupLabel>

          <SidebarGroupContent className="px-4 pb-2 text-sm leading-relaxed text-muted-foreground">
            A civic participation platform by the{" "}
            <span className="font-medium text-foreground">Walking Project</span>{" "}
            under{" "}
            <span className="font-medium text-foreground">
              Mumbai Sustainability Center
            </span>
            , focused on walkability, governance, and local civic action.
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Social */}
        <SidebarGroup>
          <SidebarGroupLabel>Connect</SidebarGroupLabel>

          <SidebarGroupContent>
            <div className="flex gap-4 px-4 py-2 text-muted-foreground">
              <Link
                href="https://x.com"
                target="_blank"
                aria-label="X"
                className="transition-colors hover:text-foreground"
              >
                <FaXTwitter size={18} />
              </Link>

              <Link
                href="https://instagram.com"
                target="_blank"
                aria-label="Instagram"
                className="transition-colors hover:text-foreground"
              >
                <FiInstagram size={18} />
              </Link>

              <Link
                href="https://linkedin.com"
                target="_blank"
                aria-label="LinkedIn"
                className="transition-colors hover:text-foreground"
              >
                <FiLinkedin size={18} />
              </Link>

              <Link
                href="https://citizenaction.in"
                target="_blank"
                aria-label="Website"
                className="transition-colors hover:text-foreground"
              >
                <FiGlobe size={18} />
              </Link>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <div className="space-y-3 px-4 py-4 text-xs text-muted-foreground">
          <div className="flex flex-wrap gap-x-3 gap-y-2">
            <Link href="/about" className="hover:text-foreground">
              About
            </Link>

            <Link href="/auth/privacy" className="hover:text-foreground">
              Privacy
            </Link>

            <Link href="/auth/terms" className="hover:text-foreground">
              Terms
            </Link>

            <Link href="/contact" className="hover:text-foreground">
              Contact
            </Link>
          </div>

          <p>© {new Date().getFullYear()} Mumbai Sustainability Center</p>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
