import styles from "../styles/layout/footer.module.css";
import { FaFacebook, FaYoutube, FaInstagram, FaLinkedin, FaGithub } from "react-icons/fa";
import { FaBluesky, FaXTwitter } from "react-icons/fa6";


export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.socialIcons}>
        <a
          href="https://x.com/walkingproject"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X"
          className="xtwitter"
        >
          <FaXTwitter/>
        </a>
        <a
          href="https://www.facebook.com/groups/walkingproject"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          className="facebook"
        >
          <FaFacebook />
        </a>
        <a 
          href="http://www.youtube.com/@WalkingProjectIndia" 
          target="_blank" 
          rel="noopener noreferrer" 
          aria-label="Youtube"
          className="youtube"
        >
          <FaYoutube />
        </a>
        <a
          href="https://www.linkedin.com/company/walking-project"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className="linkedin"
        >
          <FaLinkedin />
        </a>
        <a
          href="https://www.instagram.com/walkingprojectindia"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="instagram"
        >
          <FaInstagram />
        </a>
        <a  
          href="https://bsky.app/profile/walkingproject.bsky.social" 
          target="_blank" 
          rel="noopener noreferrer" 
          aria-label="BlueSky" 
          className="bluesky"
        >
          <FaBluesky />
        </a>
        <a  
          href="https://github.com/walkingproject" 
          target="_blank" 
          rel="noopener noreferrer" 
          aria-label="Github" 
          className="github"
        >
          <FaGithub />
        </a>
      </div>
      <div className={styles.copyright}>
        Mumbai Sustainability Centre © 2024
      </div>
    </footer>
  );
}