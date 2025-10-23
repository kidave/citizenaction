import Image from "next/image";
import styles from "styles/components/design/card.module.css";
import { useWard } from "context/WardContext";
import { useWardCommittees } from "hooks/useWardData";

export default function CommitteeTab() {
  const { wardId } = useWard();
  const { data: committees, loading, error } = useWardCommittees(wardId);

  const getAvatarUrl = (avatarUrl) => avatarUrl ? avatarUrl : "/user.png";

  if (loading) return <p>Loading committees...</p>;
  if (error) return <p>Error loading committees: {error.message}</p>;

  return (
    <div className={styles.memberList}>
      {!committees?.length ? (
        <p className={styles.empty}>
          Interested in joining the committee? Tap the <strong>Join Committee</strong> button, 
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
          </div>
        ))
      )}
    </div>
  );
}
