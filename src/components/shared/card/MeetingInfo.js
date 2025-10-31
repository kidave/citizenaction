// components/shared/MeetingInfo.js
import { useState } from "react";
import { BsCalendar2, BsClockHistory, BsClipboardData, BsCardChecklist, BsChevronUp, BsChevronDown } from "react-icons/bs";
import { MdOutlineHowToVote } from "react-icons/md";
import styles from "styles/components/design/card.module.css";

export default function MeetingInfo() {
  const [activeTab, setActiveTab] = useState("rationale");
  const [isExpanded, setIsExpanded] = useState(true);

  const meetingTabs = [
    {
      id: "rationale",
      title: "Rationale",
      icon: <BsCalendar2 />,
      content: (
        <div className={styles.tabContentFull}>
          <h4>Rationale for Monthly Meetings</h4>
          <p>
            Regular monthly meetings are essential to ensure continuity and sustained engagement among Ward Committee members. 
            These meetings provide a dedicated forum for reviewing project progress, identifying and addressing emerging challenges, and facilitating structured
            reporting and coordination with the Walking Project team.
          </p>
          <p>
            A consistent meeting schedule also helps promote accountability and build trust, reinforcing the committee's role as a reliable local body for civic collaboration. 
            The meetings may be online or offline.
          </p>
        </div>
      )
    },
    {
      id: "cadence", 
      title: "Schedule",
      icon: <BsClockHistory />,
      content: (
        <div className={styles.tabContentFull}>
          <h4>Meeting Cadence and Planning</h4>
          <p>
            Meetings should be held on a predictable, fixed date each month to allow members to plan their schedules well in advance. 
            For example, setting a recurring meeting every 2nd Saturday of the month ensures regularity and improves overall attendance. 
            Predictability strengthens participation and helps institutionalize the committee's functioning.
          </p>
          <p>
            The Convener should share a general meeting agenda at least one day prior to the meeting, so members can come prepared and discussions remain focused. 
            To ensure efficient use of everyone's time, a pre-meeting poll should be conducted to assess expected attendance and confirm quorum. 
            Online meetings are preferred for better attendance.
          </p>
        </div>
      )
    },
    {
      id: "additional",
      title: "Extra Meetings", 
      icon: <BsClipboardData  />,
      content: (
        <div className={styles.tabContentFull}>
          <h4>Additional and Sub-Group Meetings</h4>
          <p>
            Beyond the standard monthly meetings, extra meetings may be scheduled during critical project phases such as field assessments, coordination with civic agencies, or on-ground implementation.
          </p>
          <p>
            Additionally, sub-group or task-specific meetings (e.g., Mapping & Data, Community Engagement) can be organized between monthly full-committee sessions to maintain momentum on specific workstreams.
          </p>
        </div>
      )
    },
    {
      id: "minutes",
      title: "Minutes",
      icon: <BsCardChecklist />,
      content: (
        <div className={styles.tabContentFull}>
          <h4>Recording of Minutes of Meeting (MoM)</h4>
          <p>
            Each meeting must be documented through Minutes of Meeting, capturing key discussion points, action items, deadlines, and follow-ups.
          </p>
          <p>
            This documentation will be entered through admin page of the ward committee website in a prescribed format immediately after the meeting. 
            The submitted data will be stored on the cloud backend, which will serve as a live, accessible record for all committee members once published.
          </p>
          <p>
            This system reduces bureaucracy, increases transparency, supports real-time tracking, and enables committee members to refer back to past decisions and updates as needed.
          </p>
        </div>
      )
    },
    {
      id: "voting",
      title: "Voting",
      icon: <MdOutlineHowToVote />,
      content: (
        <div className={styles.tabContentFull}>
          <h4>Voting and Decision-Making</h4>
          <p>
            Voting is a key decision-making tool for the Ward Committee, ensuring transparency and consensus on issues like selection of focus stretches of footpath.
          </p>
          <p>
            For simplicity, most decisions will be made through first-past-the-post polls, with a clear closing time and poll snapshot to avoid confusion from late responses. 
            For more complex or contentious matters, ranked choice voting may be adopted if both conveners agree to the method, regardless of whether it's conducted via third-party apps or paper ballots.
          </p>
          <p>
            All voting outcomes should be documented in the meeting minutes for accountability. 
            Voting as a tool can be used whenever there are differing opinions regarding any internal decision.
          </p>
        </div>
      )
    }
  ];

  const activeContent = meetingTabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={styles.tabsContainer}>
      <div className={styles.tabsHeader}>
        <div className={styles.tabsNav}>
          {meetingTabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tabButton} ${
                activeTab === tab.id ? styles.activeTab : ''
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              <span className={styles.tabTitle}>{tab.title}</span>
            </button>
          ))}
        </div>
        
        <button 
          className={styles.expandButton}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? <BsChevronUp /> : <BsChevronDown />}
        </button>
      </div>
      
      {isExpanded && (
        <div className={styles.tabContent}>
          {activeContent}
        </div>
      )}
    </div>
  );
}