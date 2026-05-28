export default function getPostTypeConfig(type) {
  const config = {
    // =====================================================
    // REPORT
    // =====================================================

    report: {
      displayMode: "range",

      lifecycle: true,

      showAddress: true,

      showTime: true,

      showJoin: false,

      showCountdown: false,

      statuses: {
        planned: {
          label: "Planned",

          className: "bg-indigo-100 text-indigo-700",
        },

        ongoing: {
          label: "Ongoing",

          className: "bg-green-100 text-green-700 border border-gray-200",
        },

        completed: {
          label: "Completed",

          className: "bg-green-100 text-green-700",
        },

        dropped: {
          label: "Dropped",

          className: "bg-slate-200 text-slate-700 border border-slate-300",
        },

        postponed: {
          label: "Postponed",

          className: "bg-amber-100 text-amber-800",
        },
      },
    },

    // =====================================================
    // MEETING
    // =====================================================

    meeting: {
      displayMode: "lifecycle",

      lifecycle: true,

      showAddress: true,

      showTime: true,

      showJoin: true,

      showCountdown: true,

      statuses: {
        upcoming: {
          hidden: true,

          label: "Upcoming",

          className: "bg-blue-100 text-blue-700",
        },

        live: {
          label: "LIVE NOW",

          className: "bg-red-600 text-white",
        },

        ended: {
          hidden: true,

          label: "Ended",

          className: "bg-muted text-muted-foreground border",
        },

        postponed: {
          label: "Postponed",

          className: "bg-amber-100 text-amber-800",
        },

        cancelled: {
          label: "Cancelled",

          className: "bg-red-100 text-red-700",
        },
      },
    },

    // =====================================================
    // EVENT
    // =====================================================

    event: {
      displayMode: "lifecycle",

      lifecycle: true,

      showAddress: true,

      showTime: true,

      showJoin: true,

      showCountdown: true,

      statuses: {
        upcoming: {
          hidden: true,

          label: "Upcoming",

          className: "bg-blue-100 text-blue-700",
        },

        live: {
          label: "LIVE NOW",

          className: "bg-red-600 text-white",
        },

        ended: {
          hidden: true,

          label: "Ended",

          className: "bg-muted text-muted-foreground border",
        },

        postponed: {
          label: "Postponed",

          className: "bg-amber-100 text-amber-800",
        },

        cancelled: {
          label: "Cancelled",

          className: "bg-red-100 text-red-700",
        },
      },
    },

    // =====================================================
    // UPDATE
    // =====================================================

    update: {
      displayMode: "month",

      lifecycle: false,

      showAddress: false,

      showTime: false,

      showJoin: false,

      showCountdown: false,

      statuses: {},
    },

    // =====================================================
    // ACTION
    // =====================================================

    action: {
      displayMode: "simple",

      lifecycle: false,

      showAddress: true,

      showTime: true,

      showJoin: false,

      showCountdown: false,

      statuses: {},
    },
  };

  return (
    config[type] || {
      displayMode: "simple",

      lifecycle: false,

      showAddress: true,

      showTime: true,

      showJoin: false,

      showCountdown: false,

      statuses: {},
    }
  );
}
