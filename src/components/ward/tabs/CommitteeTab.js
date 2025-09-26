import Image from "next/image";
import styles from "styles/components/card.module.css";
import { useWard } from "context/WardContext";
import useWardCommittees from "hooks/useWardCommittees";
import { MdVolunteerActivism } from "react-icons/md";
import {  FaUserAlt, FaUserTie, FaUserGraduate, FaWheelchair, FaStore, FaHome, FaChalkboardTeacher, FaUserSecret } from "react-icons/fa";
import { FaUserDoctor } from "react-icons/fa6";
import CommitteeButton from "components/shared/ui/CommitteeButton";

const STAKEHOLDER_ICONS = {
  "Senior Citizen": FaUserAlt,
  "Business Owner": FaUserTie,
  "Civic Official": FaUserSecret,
  "Student": FaUserGraduate,
  "Person with Disability": FaWheelchair,
  "Resident": FaHome,
  "Street Vendor": FaStore,
  "Volunteer": MdVolunteerActivism,
  "Educator": FaChalkboardTeacher,
  "Healthcare Worker": FaUserDoctor,
};

export default function CommitteeTab() {
  const { wardId } = useWard();
  const { committees, loading, error } = useWardCommittees(wardId);

  const getAvatarUrl = (avatarUrl) => {
    if (!avatarUrl) return "/user.png";
    if (avatarUrl.startsWith("http")) return avatarUrl;
    return `https://gostxgfnoilfmybaohhx.supabase.co/storage/v1/object/public/profile/avatar/${avatarUrl}`;
  };

  if (loading) return <p>Loading committees...</p>;
  if (error) return <p>Error loading committees: {error.message}</p>;

  return (
    <div className={styles.memberList}>
      {committees.length === 0 ? (
        <p className={styles.emptyMessage}>
          Interested in joining the committee? Tap the <strong>Join Committee</strong> button in the homepage, 
          or email us at <a href="mailto:info@walkingproject.org">info@walkingproject.org</a>.
        </p>
      ) : (
        committees.map((committee) => (
          <div key={committee.user_id} className={styles.memberCard}>
            <div className={styles.memberImageContainer}>
              <Image
                src={getAvatarUrl(committee.avatar_url)}
                alt={`${committee.name}'s avatar`}
                height={80}
                width={80}
                className={styles.memberImage}
                priority
                onError={(e) => { e.target.src = "/user.png"; }}
              />
            </div>
            <h4 className={styles.memberDetail}>{committee.name}</h4>
            <div className={styles.memberInfoContainer}>
              {committee.stakeholder && (
                <div className={styles.memberCategory}>
                  {(() => {
                    const Icon = STAKEHOLDER_ICONS[committee.stakeholder] || FaUserAlt;
                    return <Icon className={styles.stakeholderIcon} />;
                  })()}
                  <span>{committee.stakeholder}</span>
                </div>
              )}
              {committee.designation && (
                <p className={styles.memberInformation}>{committee.designation}</p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
