// components/shared/image/SingleImageEmbed.js
import styles from "./image.module.css";

export default function ImageEmbed({ src, alt = "Embedded Image" }) {
  if (!src) return null;

  return (
    <div className={styles.imageEmbed}>
      <img
        src={src}
        alt={alt}
        onError={(e) => (e.target.src = "/no-image.svg")}
      />
    </div>
  );
}
