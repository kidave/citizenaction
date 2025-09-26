// components/shared/ui/FormPhoneInput.js
import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import styles from "styles/components/form.module.css";

export default function FormPhoneInput({ 
  value, 
  countryCode, 
  onChange, 
  error, 
  className = "",
  ...props 
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`${styles.phoneInputContainer} ${focused ? styles.focused : ""} ${error ? styles.error : ""} ${className}`}>
      <PhoneInput
        country={"in"}
        value={value}
        onChange={(mobile, country) => onChange(mobile, country)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        inputProps={{
          ...props,
          required: true,
        }}
        inputStyle={{
          width: "100%",
          height: "auto",
          border: "none",
          outline: "none",
          fontSize: "1rem",
          padding: "1rem",
          paddingLeft: "52px",
          background: "transparent"
        }}
        buttonStyle={{
          border: "none",
          background: "transparent",
          padding: "0 0 0 1rem"
        }}
        dropdownStyle={{
          borderRadius: "12px",
          marginTop: "4px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)"
        }}
      />
    </div>
  );
}