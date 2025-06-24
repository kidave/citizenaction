import styles from "../../../styles/components/card.module.css";
import Image from "next/image";
import { FaFacebook, FaInstagram, FaLinkedin, FaGithub, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const SOCIAL_ICONS = {
  facebook: FaFacebook,
  instagram: FaInstagram,
  linkedin: FaLinkedin,
  github: FaGithub,
  xtwitter: FaXTwitter,
  whatsapp: FaWhatsapp,
};

function getImageUrl(filename) {
  if (!filename) return null;
  return `https://gostxgfnoilfmybaohhx.supabase.co/storage/v1/object/public/profile/avatar/${filename}`;
}

export default function MemberTab({ members }) {
  return (
    <div className={styles.memberList}>
      {members.length === 0 ? (
        <p>Be a Member. Email us at info@walkingproject.org </p>
      ) : (
        members.map((member) => (
          <div key={member.member_id} className={styles.memberCard}>
            <div className={styles.memberImageContainer}>
              <Image
                src={getImageUrl(member.avatar_url) || '/user.png'}
                alt={member.member_name}
                width={80}
                height={80}
                className={styles.memberImage}
                priority
                onError={(e) => {
                  e.target.src = '/user.png';
                }}
              />
            </div>
              <h4 className={styles.memberDetail}>{member.member_name}</h4>
              <p className={styles.memberInformation}>{member.designation}</p>
            <div className={styles.socialIcons}>
              {member.social && Object.entries(member.social).map(([platform, url]) => {
                const Icon = SOCIAL_ICONS[platform];
                return Icon && url ? (
                  <a key={platform} href={url} target="_blank" rel="noopener noreferrer" aria-label={platform} className={platform}>
                    <Icon />
                  </a>
                ) : null;
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}