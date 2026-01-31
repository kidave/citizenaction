import styles from "styles/components/layout/Footer.module.css";
import {
  FaFacebook,
  FaYoutube,
  FaInstagram,
  FaLinkedin,
  FaGithub,
} from "react-icons/fa";
import { FaBluesky, FaXTwitter } from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="mt-auto bg-gradient-to-br from-slate-800 to-slate-700 text-white">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">

        {/* Info */}
        <div className="text-center md:text-left max-w-md">
          <h3 className="text-lg font-semibold">Citizen Action</h3>
          <p className="text-sm text-slate-300 mt-2">
            A civic documentation platform designed to make citizen action visible
          </p>
        </div>

        {/* Social Icons (keep CSS module) */}
        <div className={styles.socialIcons}>
          <a href="https://x.com/walkingproject" target="_blank" rel="noreferrer" className={styles.xtwitter}>
            <FaXTwitter />
          </a>
          <a href="https://www.facebook.com/groups/walkingproject" target="_blank" rel="noreferrer" className={styles.facebook}>
            <FaFacebook />
          </a>
          <a href="http://www.youtube.com/@WalkingProjectIndia" target="_blank" rel="noreferrer" className={styles.youtube}>
            <FaYoutube />
          </a>
          <a href="https://www.linkedin.com/company/walking-project" target="_blank" rel="noreferrer" className={styles.linkedin}>
            <FaLinkedin />
          </a>
          <a href="https://www.instagram.com/walkingprojectindia" target="_blank" rel="noreferrer" className={styles.instagram}>
            <FaInstagram />
          </a>
          <a href="https://bsky.app/profile/walkingproject.bsky.social" target="_blank" rel="noreferrer" className={styles.bluesky}>
            <FaBluesky />
          </a>
          <a href="https://github.com/walkingproject" target="_blank" rel="noreferrer" className={styles.github}>
            <FaGithub />
          </a>
        </div>
      </div>

      <div className="text-center text-xs text-slate-400 border-t border-white/10 py-4">
        Mumbai Sustainability Centre © 2024
      </div>
    </footer>
  );
}
