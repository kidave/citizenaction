"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { AnimatePresence, motion } from "framer-motion";
import { Home, Settings, Menu, X, User } from "lucide-react";

import InstallAppButton from "@/components/layout/InstallAppButton";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";

export default function FloatingMenu() {
  const router = useRouter();
  const { toggleSidebar } = useSidebar();
  const { user } = useAuth();

  const [open, setOpen] = useState(false);

  const items = [
    {
      icon: Home,
      label: "Home",
      onClick: () => {
        router.push("/");
        setOpen(false);
      },
    },
    {
      icon: Settings,
      label: "Settings",
      onClick: () => {
        router.push("/settings");
        setOpen(false);
      },
    },
    {
      icon: user ? User : Menu,
      label: user ? "Profile" : "Menu",
      onClick: () => {
        toggleSidebar();
        setOpen(false);
      },
    },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="mb-3 flex flex-col items-center gap-2"
          >
            {items.map(({ icon: Icon, label, onClick }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.18 }}
              >
                <Button
                  className="h-12 w-12"
                  variant="outline"
                  size="icon"
                  onClick={onClick}
                >
                  <Icon className="h-8 w-8" />
                </Button>
              </motion.div>
            ))}

            {/* INSTALL CITIZEN ACTION */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{
                duration: 0.18,
                delay: 0.05,
              }}
            >
              <InstallAppButton onInstalled={() => setOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        size="icon"
        variant="outline"
        className="relative h-12 w-12 rounded-full"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="relative flex h-full w-full items-center justify-center">
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute"
              >
                <X className="h-5 w-5" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute"
              >
                <Menu className="h-5 w-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Button>
    </div>
  );
}
