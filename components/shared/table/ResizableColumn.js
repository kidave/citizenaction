import { useCallback } from 'react';
import styles from '../../../styles/components/table.module.css';

export default function ResizableColumn({ columnKey, currentWidth, onResize }) {
  const startResize = useCallback((e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = currentWidth;
    
    const doResize = (moveEvent) => {
      const newWidth = startWidth + moveEvent.clientX - startX;
      onResize(prev => ({
        ...prev,
        [columnKey]: Math.max(50, newWidth)
      }));
    };

    const stopResize = () => {
      window.removeEventListener('mousemove', doResize);
      window.removeEventListener('mouseup', stopResize);
    };

    window.addEventListener('mousemove', doResize);
    window.addEventListener('mouseup', stopResize);
  }, [columnKey, currentWidth, onResize]);

  return (
    <div 
      className={styles.resizeHandle}
      onMouseDown={startResize}
    />
  );
}