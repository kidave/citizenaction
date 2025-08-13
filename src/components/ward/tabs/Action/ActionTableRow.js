import TableCell from "components/shared/table/TableCell";

function getStatusClass(status, cellStyles) {
  switch (status?.toLowerCase()) {
    case "pending":
      return cellStyles.statusPending;
    case "resolved":
      return cellStyles.statusResolved;
    case "in progress":
      return cellStyles.statusInProgress;
    case "blocked":
      return cellStyles.statusBlocked;
    default:
      return "";
  }
}

function getImageUrl(filename) {
  if (!filename) return null;
  return `https://gostxgfnoilfmybaohhx.supabase.co/storage/v1/object/public/ward/${filename}`;
}

export default function ActionTableRow({
  action,
  setSelectedImage,
  setIsImageModalOpen,
  cellStyles,
}) {
  return (
    <tr>
      <TableCell>{new Date(action.event_date).toLocaleDateString()}</TableCell>
      <TableCell>{action.action_type}</TableCell>
      <TableCell>{action.description}</TableCell>
      <TableCell>
        <span
          className={`${cellStyles.statusTag} ${getStatusClass(action.status, cellStyles)}`}
        >
          {action.status}
        </span>
      </TableCell>
      <TableCell>
        {action.reference_image ? (
          <button
            className={cellStyles.button}
            onClick={() => {
              setSelectedImage(getImageUrl(action.reference_image));
              setIsImageModalOpen(true);
            }}
          >
            View Image
          </button>
        ) : (
          "No image"
        )}
      </TableCell>
    </tr>
  );
}
