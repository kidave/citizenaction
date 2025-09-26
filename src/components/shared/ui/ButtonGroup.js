// components/shared/ui/ButtonGroup.js
import styles from "styles/components/buttons.module.css";

export const ButtonGroup = ({ 
  children, 
  direction = "horizontal",
  align = "start",
  className = "" 
}) => {
  return (
    <div 
      className={`${styles.buttonGroup} ${styles[direction]} ${className}`}
      style={{ 
        justifyContent: align === "center" ? "center" : 
                    align === "end" ? "flex-end" : "flex-start"
      }}
    >
      {children}
    </div>
  );
};

export default ButtonGroup;