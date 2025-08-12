
export default function TableCell({ children, isHidden }) {
  return (
    <td style={{ display: isHidden ? 'none' : 'table-cell' }}>
      {children}
    </td>
  );
}