// components/home/Logo.js
import Link from "next/link";
import styles from "styles/components/ui/Logo.module.css";
import Image from "next/image";

export default function Logo() {
  return (
    <Link href="/" className={styles.logoContainer}>
      <div className={styles.logo}>
        <Image
          src="/wp_icon_sm.avif"
          alt="Logo"
          width={32} 
          height={32}
        />
        <Image
          src="/wp_text_logo.avif"
          alt="Walking Project"
          width={128} 
          height={128}
        />
      </div>
    </Link>
  );
}
