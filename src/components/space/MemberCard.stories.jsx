import MemberCard from "./MemberCard";

const meta = {
  title: "Spaces/Members/Member Card",
  component: MemberCard,
  args: {
    member: {
      id: "aarav-kulkarni",
      username: "aarav-kulkarni",
      name: "Aarav Kulkarni",
      designation: "Community organizer",
      locality: "Pune",
      membership_message:
        "I help neighbors collaborate on practical improvements to our shared spaces.",
      created_at: "2024-10-15T12:00:00.000Z",
    },
  },
};

export default meta;

export const IntroducedMember = {};

export const WithoutIntroduction = {
  args: {
    member: {
      username: "new-member",
      name: "New member",
    },
  },
};
