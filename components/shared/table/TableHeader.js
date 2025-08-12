import styles from '../../../styles/components/table.module.css';


export default function TableHeader({ width, children }) {
  return (
    <th style={{ width }} className={styles.header}>
      {children}
    </th>
  );
}