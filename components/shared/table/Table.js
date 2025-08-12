import styles from '../../../styles/components/table.module.css';

export default function Table({ children, className }) {
  return (
    <table className={`${styles.table} ${className || ''}`}>
      {children}
    </table>
  );
}