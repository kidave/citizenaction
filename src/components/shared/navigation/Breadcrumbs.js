import Link from "next/link";
import { useRouter } from "next/router";
import styles from "styles/compoonents/navigation/Breadcrumbs.module.css";

export default function Breadcrumbs() {
  const router = useRouter();
  const pathnames = router.asPath.split('/').filter(x => x);

  return (
    <nav className={styles.breadcrumbs}>
      <Link href="/" className={styles.breadcrumbItem}>Home</Link>
      
      {pathnames.map((value, index) => {
        const href = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const label = value.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        return isLast ? (
          <span key={href} className={styles.breadcrumbItemActive}>
            {label}
          </span>
        ) : (
          <Link key={href} href={href} className={styles.breadcrumbItem}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}