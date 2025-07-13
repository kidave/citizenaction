import styles from "../../../styles/components/card.module.css";
import Image from "next/image";
import { MdVolunteerActivism } from "react-icons/md";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaGithub,
  FaWhatsapp,
  FaUserPlus,
  FaUserAlt,
  FaUserTie,
  FaUserGraduate,
  FaWheelchair,
  FaStore,
  FaHome,
  FaChalkboardTeacher,
  FaUserSecret
} from "react-icons/fa";
import { FaXTwitter, FaUserDoctor } from "react-icons/fa6";
import Form from '../../Form';
import { useState } from 'react';
import formStyles from '../../../styles/components/form.module.css';
import { useWard } from '../../../src/context/WardContext';

const SOCIAL_ICONS = {
  facebook: FaFacebook,
  instagram: FaInstagram,
  linkedin: FaLinkedin,
  github: FaGithub,
  xtwitter: FaXTwitter,
  whatsapp: FaWhatsapp,
};

const STAKEHOLDER_ICONS = {
  'Senior Citizen': <FaUserAlt className={styles.stakeholderIcon} />,
  'Business Owner': <FaUserTie className={styles.stakeholderIcon} />,
  'Civic Official': <FaUserSecret className={styles.stakeholderIcon} />,
  'Student': <FaUserGraduate className={styles.stakeholderIcon} />,
  'Person with Disability': <FaWheelchair className={styles.stakeholderIcon} />,
  'Resident': <FaHome className={styles.stakeholderIcon} />,
  'Street Vendor': <FaStore className={styles.stakeholderIcon} />,
  'Volunteer': <MdVolunteerActivism className={styles.stakeholderIcon} />,
  'Educator': <FaChalkboardTeacher className={styles.stakeholderIcon} />,
  'Healthcare Worker': <FaUserDoctor className={styles.stakeholderIcon} />
};

export default function MemberTab({ members }) {
  const [showForm, setShowForm] = useState(false);
  const { wardId } = useWard();

  const getAvatarUrl = (avatarUrl) => {
    // Return default if no avatar URL
    if (!avatarUrl) return '/user.png';
    
    // If it's already a full URL (Google OAuth or other external source)
    if (avatarUrl.startsWith('http')) {
      return avatarUrl;
    }
    
    // For Supabase Storage paths
    return `https://gostxgfnoilfmybaohhx.supabase.co/storage/v1/object/public/profile/avatar/${avatarUrl}`;
  };

  const getRoleDisplay = (member) => {
    if (member.is_convenor) return 'Convenor';
    if (member.is_co_convenor) return 'Co-Convenor';
    return 'Member';
  };

  return (
    <div className={styles.memberList}>
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
                src={getAvatarUrl(member.avatar_url)}
                alt={`${member.first_name} ${member.last_name || ''}`}
                width={80}
                height={80}
                className={styles.memberImage}
                priority
                onError={(e) => {
                  e.target.src = '/user.png';
                  console.error('Failed to load avatar for member:', member.member_id);
                }}
              />
            </div>
            <h4 className={styles.memberDetail}>
              {member.first_name}{member.last_name ? ` ${member.last_name}` : ''}
            </h4>
            <div className={styles.memberInfoContainer}>
              <p className={styles.memberRole}>{getRoleDisplay(member)}</p>
              {member.stakeholder_category && (
                <div className={styles.memberCategory}>
                  {STAKEHOLDER_ICONS[member.stakeholder_category] || <FaUserAlt className={styles.stakeholderIcon} />}
                  <span>{member.stakeholder_category}</span>
                </div>
              )}
              {member.designation && (
                <p className={styles.memberInformation}>{member.designation}</p>
              )}
            </div>
            <div className={styles.socialIcons}>
              {member.social && Object.entries(member.social).map(([platform, url]) => {
                const Icon = SOCIAL_ICONS[platform];
                return Icon && url ? (
                  <a 
                    key={platform} 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    aria-label={platform} 
                    className={platform}
                  >
                    <Icon />
                  </a>
                ) : null;
              })}
            </div>
          </div>
        ))
      )}

      <button 
        onClick={() => setShowForm(true)} 
        className={formStyles.applyFloatingBtn}
        aria-label="Apply to join committee"
      >
        <FaUserPlus/>
      </button>

      <Form
        show={showForm}
        onClose={() => setShowForm(false)}
        defaultWard={wardId}
        defaultRole="member"
      />
    </div>
  );
}