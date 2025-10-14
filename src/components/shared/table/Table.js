import styles from "styles/components/data/table.module.css";

export default function Table({ children, className }) {
  return (
    <table className={`${styles.table} ${className || ""}`}>{children}</table>
  );
}
