// components/Spinner.js
import styles from '../../styles/components/spinner.module.css';

export default function Spinner({ size = 'medium' }) {
  const sizeClass = styles[size] || styles.medium;
  
  return (
    <div className={`${styles.spinner} ${sizeClass}`}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
}