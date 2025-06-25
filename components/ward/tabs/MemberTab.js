import styles from "../../../styles/components/card.module.css";
import Image from "next/image";
import { FaFacebook, FaInstagram, FaLinkedin, FaGithub, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import Form from '../../Form';
import { useState } from 'react';
import formStyles from '../../../styles/components/form.module.css'; // Ensure this is imported for primaryCta
import { FaUserPlus } from "react-icons/fa";

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

export default function MemberTab({ members, wardId, onApply }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className={styles.memberList}>
      {/* Conditionally render message if no members, otherwise render member cards */}
      {members.length === 0 ? (
        <p>
          Want to join the committee? Tap the <strong>Apply</strong> button at the bottom right, or email us at{' '} 
           <a href="mailto:info@walkingproject.org">info@walkingproject.org</a>.
        </p>
      ) : (
        members.map((member) => (
          <div key={member.member_id} className={styles.memberCard}>
            <div className={styles.memberImageContainer}>
              <Image
                src={getImageUrl(member.avatar_url) || '/user.png'}
                alt={member.first_name}
                width={80}
                height={80}
                className={styles.memberImage}
                priority
                onError={(e) => {
                  e.target.src = '/user.png';
                }}
              />
            </div>
            <h4 className={styles.memberDetail}>{member.first_name}{member.last_name ? ` ${member.last_name}` : ''}</h4>
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

      {/* This button is now always rendered at the end of the memberList div,
          making it consistently visible regardless of member count. */}
      <button onClick={() => setShowForm(true)} className={formStyles.applyFloatingBtn}>
        <FaUserPlus/>
      </button>

      {/* The Form component is correctly placed here and its show prop
          is controlled by the local showForm state */}
      <Form
        show={showForm}
        onClose={() => setShowForm(false)}
        defaultWard={wardId}
        defaultRole="member"
      />
    </div>
  );
}
