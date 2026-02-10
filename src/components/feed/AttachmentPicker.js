export default function AttachmentPicker({ onUpload }) {
  return (
    <input
      type="file"
      accept="image/*,.pdf"
      onChange={(e) => onUpload(e.target.files[0])}
    />
  );
}
