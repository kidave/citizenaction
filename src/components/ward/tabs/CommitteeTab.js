// components/CommitteeTab.js
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import styles from "styles/tabs/committee.module.css";
import { useWard } from "context/WardContext";
import { useWardCommittees } from "hooks/useWardData";
import { FaChevronDown, FaChevronUp, FaUsers, FaUserTie, FaUserFriends, FaHandshake, FaInfoCircle } from "react-icons/fa";

export default function CommitteeTab() {
  const { wardCode } = useWard();
  const { data: committees, loading, error } = useWardCommittees(wardCode);
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const getAvatarUrl = (avatarUrl) => avatarUrl ? avatarUrl : "/user.png";

  // Committee information sections
  const committeeInfo = [
    {
      id: "composition",
      title: "Composition of the Ward Committee",
      icon: <FaUsers />,
      content: (
        <div>
          <div className={styles.infoSection}>
            <h5>A. Number of Members</h5>
            <p>Up to 15 members per ward: Convener, Co-Convener + 13 active members.</p>
          </div>
          <div className={styles.infoSection}>
            <h5>B. Expected Diversity in the Ward Committee</h5>
            <p>To ensure inclusive decision-making and a broad representation of local interests, Ward Committees include members from diverse stakeholder groups:</p>
            <ul className={styles.bulletList}>
              <li>Daily Commuters and Residents of housing societies to represent local residential interests.</li>
              <li>Street Vendors and Hawkers through recognized local Town Vending Committee and Informal Vendor Unions.</li>
              <li>Representatives of Persons with Disabilities to ensure accessibility concerns are addressed.</li>
              <li>Educational Institutions & Healthcare Workers</li>
              <li>Business Owners & Representatives from Commercial Establishments and Business Chambers</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "roles",
      title: "Roles and Responsibilities",
      icon: <FaUserTie />,
      content: (
        <div>
          <div className={styles.infoSection}>
            <h5>A. Convener</h5>
            <ul className={styles.bulletList}>
              <li>Primary point of contact between committee and civic authorities</li>
              <li>Schedule and organize monthly committee meetings</li>
              <li>Finalize agenda and ensure circulation prior to meetings</li>
              <li>Facilitate decision-making and consensus building</li>
              <li>Submit meeting minutes and updates</li>
              <li>Lead onboarding of new members and support role allocation within the committee.</li>
            </ul>
          </div>
          <div className={styles.infoSection}>
            <h5>B. Co-Convener</h5>
            <ul className={styles.bulletList}>
              <li>Support Convener in planning and executing meetings</li>
              <li>Take lead on specific tasks involving data collation, communications and documentation</li>
              <li>Ensure follow-up on assigned action points</li>
              <li>Step in as acting Convener when required</li>
              <li>Encourage and facilitate member participation</li>
              <li>Maintain committee morale and cohesion</li>
            </ul>
          </div>
          <div className={styles.infoSection}>
            <h5>C. Members</h5>
            <ul className={styles.bulletList}>
              <li>Attend monthly meetings and actively participate in discussions and decision-making </li>
              <li>Identify walkability issues through surveys, observations and resident inputs</li>
              <li>Support the assessment of footpaths, crossings, junctions and pedestrian routes</li>
              <li>Assist in documentation efforts (photos, notes, data collection and feedback)</li>
              <li>Participate in community outreach activities and awareness activities.</li>
              <li>Coordinate with assigned leads for focused tasks</li>
              <li>Uphold values of inclusivity, transparency, and cooperation in all engagements.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "setup",
      title: "Setting Up the Committee",
      icon: <FaHandshake />,
      content: (
        <div>
          <div className={styles.infoSection}>
            <p>The Ward Committee setup begins with identifying a Convener through public call for expressions of interest. This ensures leadership comes from within the community and is rooted in a genuine commitment to improving walkability. The Convener may also identify a Co-Convener to support coordination and share responsibilities.</p>
          </div>
          <div className={styles.infoSection}>
            <h5>A. Identification of Convener</h5>
            <p>
              The Convener is ideally a locally active resident or member of a citizen group with a demonstrated interest in civic issues. 
              Walking Project may use existing networks, past collaborators, or an open form to identify suitable individuals. 
              Once selected, the Convener becomes the primary point of contact for setting up and leading the Ward Committee. 
              Walking Project provides them with an orientation, the SOP Handbook, and necessary templates and tools.
            </p>
          </div>
          <div className={styles.infoSection}>
            <h5>B. Organizing a Community Talk</h5>
            <p>The Conveners first task is to organize a Community Talk in collaboration with Walking Project. This is an open public meeting that:</p>
            <ul className={styles.bulletList}>
              <li>Introduces the walkability improvement initiative to local residents and stakeholders</li>
              <li>Explains the purpose and structure of the Ward Committee</li>
              <li>Highlights the role of citizen involvement in improving local walkability</li>
              <li>Invites residents to express interest in joining the committee</li>
            </ul>
            <br></br>
            <p>Walking Project supports this session by providing:</p>
            <ul className={styles.bulletList}>
              <li>Presentation slides or posters</li>
              <li>Walkability Handbook copies</li>
              <li>Promotional materials and QR codes for sign-up</li>
              <li>Assistance in outreach and logistics</li>
            </ul>
            <br></br>
            <p>The Community Talk sets the tone for participatory governance and helps gather initial momentum.</p>
          </div>
          <div className={styles.infoSection}>
            <h5>C. Public Call for Membership</h5>
            <p>
              Following the Community Talk, a public call is made to invite residents and stakeholders to join the Ward Committee. 
              Walking Project shares an Expression of Interest (EOI) form, accessible via a QR code during and after the event, to gather applications. 
              The form collects basic information, ward affiliation, relevant skills, interests, and availability.
              The Convener, with support from Walking Project, reviews the responses to select a diverse and committed group of up to 15 members, ensuring balanced representation from key community groups.
            </p>
          </div>
          <div className={styles.infoSection}>
            <h5>D. Finalizing Meeting Logistics</h5>
            <p>
              The Convener is responsible for conducting monthly online meetings for easier convening.
              Alternatively identifying a suitable venue for physical meetings should be done by them typically the Ward Office or a public community space. Online meetings are suggested for easier logistics. 
              Notice of meeting should be communicated in advance.
            </p>
          </div>
          <div className={styles.infoSection}>
            <h5>E. Internal Onboarding and Role Allocation</h5>
            <p>Once the committee is formed, an internal kickoff meeting is held to introduce members and initiate collaboration. Roles such as Communications, Mapping, and Stakeholder Liaison are discussed and assigned based on members interests and strengths, laying the foundation for effective teamwork and accountability.</p>
          </div>
          <div className={styles.infoSection}>
            <h5>F. Distribution of Resources and Orientation</h5>
            <p>At the initial meeting, Walking Project facilitates the following:</p>
            <ul className={styles.bulletList}>
              <li>Distribution of the Walkability Handbook and Ward Committee SOP Handbook</li>
              <li>Overview of the walkability assessment tools</li>
              <li>Orientation for Convener and Co-Convener on administrative tasks</li>
              <li>Templates for MoM, letters, and documentation protocols</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  if (loading) return <p>Loading committees...</p>;
  if (error) return <p>Error loading committees: {error.message}</p>;

  return (
    <div className={styles.committeeContainer}>
      {/* Current Committee Members */}
      <div className={styles.membersSection}>

        {!committees?.length ? (
          <div className={styles.joinCta}>
              <p>Be the first to one to help shape sustainable neighborhoods in your ward!</p>
              <Link href="/joincommittee" className={styles.joinButton}>
                Join Committee
              </Link>
          </div>
        ) : (
          <>
            <div className={styles.memberList}>
              {committees.map((committee) => (
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
                  {committee.designation && (
                    <p className={styles.memberRole}>{committee.designation}</p>
                  )}
                </div>
              ))}
            </div>
            
            {/* Join CTA for when there are members */}
            <div className={styles.joinCta}>
              <div className={styles.ctaContent}>
                <p>Help shape sustainable neighborhoods in your ward!</p>
                <Link href="/joincommittee" className={styles.joinButton}>
                  Join Committee
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
      {/* Committee Information Sections */}
      <div className={styles.infoContainer}>
        {committeeInfo.map((section) => (
          <div key={section.id} className={styles.infoCard}>
            <div 
              className={styles.infoHeader}
              onClick={() => toggleSection(section.id)}
            >
              <div className={styles.headerContent}>
                <span className={styles.sectionIcon}>{section.icon}</span>
                <h3 className={styles.sectionTitle}>{section.title}</h3>
              </div>
              <motion.div
                animate={{ rotate: expandedSections[section.id] ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className={styles.expandIcon}
              >
                <FaChevronDown />
              </motion.div>
            </div>

            <AnimatePresence>
              {expandedSections[section.id] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className={styles.infoContent}
                >
                  {section.content}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}