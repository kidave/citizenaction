export default function getPostTypeConfig(type) {
  const config = {
    report: {
      showStatus: true,
      showCountdown: false,
      showLocation: true,
      showCalendar: false,
    },

    meeting: {
      showStatus: false,
      showCountdown: true,
      showLocation: true,
      showCalendar: true,
    },

    action: {
      showStatus: false,
      showCountdown: false,
      showLocation: true,
      showCalendar: false,
    },
  };

  return (
    config[type] || {
      showStatus: false,
      showCountdown: false,
      showLocation: true,
      showCalendar: false,
    }
  );
}