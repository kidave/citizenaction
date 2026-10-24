import GovernancePositionTimeline from "./GovernancePositionTimeline";

const meta = {
  title: "Governance/Positions/Appointment Timeline",
  component: GovernancePositionTimeline,
  args: {
    position: {
      name: "Director of Public Works",
      description: "Leads public infrastructure and maintenance programs.",
      address: "Civic Centre, Pune",
    },
    organization: {
      name: "Pune City Council",
    },
    timeline: [
      {
        appointment_id: "appointment-1",
        person_name: "Maya Shah",
        started_at: "2024-06-01T12:00:00.000Z",
        ended_at: null,
        is_primary: true,
        is_vacant: false,
        notes: "Current appointment",
      },
      {
        appointment_id: "appointment-2",
        person_name: "Ravi Mehta",
        started_at: "2020-01-15T12:00:00.000Z",
        ended_at: "2024-05-31T12:00:00.000Z",
        is_primary: false,
        is_vacant: false,
      },
    ],
  },
};

export default meta;

export const AppointmentHistory = {};

export const NoHistory = {
  args: {
    timeline: [],
  },
};
