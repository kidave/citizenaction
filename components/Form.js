// /components/Form.js
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../utils/supabaseClient";
import styles from "../styles/components/form.module.css";
import { useRouter } from "next/router";

import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export default function Form({ show, onClose }) {
  const router = useRouter();
  const [divisions, setDivisions] = useState([]);
  const [wards, setWards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("");

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();

  // Fetch initial data
  useEffect(() => {
    if (!show) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [divisionsRes, categoriesRes] = await Promise.all([
          fetch("/api/location/division"),
          fetch("/api/committee/stakeholder")
        ]);
        
        setDivisions(await divisionsRes.json());
        setCategories(await categoriesRes.json());
      } catch (error) {
        setErrorMsg("Failed to load form data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [show]);

  // Fetch wards on division change
  const handleDivisionChange = async (divisionCode) => {
    setValue("ward", "");
    setWards([]);

    if (!divisionCode) return;

    try {
      const res = await fetch(`/api/location/ward?division=${divisionCode}`);
      setWards(await res.json());
    } catch (error) {
      setErrorMsg("Failed to load wards");
    }
  };

  // Submit form
  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (!phone) {
      setErrorMsg('Phone number is required');
      setLoading(false);
      return;
    }

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;

      const res = await fetch('/api/committee/form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ward_code: data.ward,
          stakeholder_id: parseInt(data.stakeholder),
          phone,
          country_code: countryCode
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Submission failed');
      }

      setSuccessMsg('Application submitted successfully!');
      if (onSuccess) onSuccess(); // Call the success callback
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };


  if (!show) return null;

  return (
    <div className={styles.formOverlay} onClick={onClose}>
      <div className={styles.formModal} onClick={(e) => e.stopPropagation()}>
        {loading ? (
          <div className={styles.messageContainer}><h3>Loading...</h3></div>
        ) : successMsg ? (
          <div className={styles.successMessage}>
            <h3>Success!</h3>
            <p>{successMsg}</p>
            <button onClick={onClose}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <h3>Apply to Join Committee</h3>
            {errorMsg && <div className={styles.error}>{errorMsg}</div>}

            {/* Division */}
            <label>Division*</label>
            <select 
              {...register("division", { required: "Required" })}
              onChange={(e) => {
                handleDivisionChange(e.target.value);
                setValue("division", e.target.value);
              }}
            >
              <option value="">Select Division</option>
              {divisions.map(d => (
                <option key={d.code} value={d.code}>{d.name}</option>
              ))}
            </select>
            {errors.division && <span className={styles.errorText}>{errors.division.message}</span>}

            {/* Ward */}
            <label>Ward*</label>
            <select 
              {...register("ward", { required: "Required" })}
              disabled={!watch("division") || wards.length === 0}
            >
              <option value="">Select Ward</option>
              {wards.map(w => (
                <option key={w.code} value={w.code}>{w.name}</option>
              ))}
            </select>
            {errors.ward && <span className={styles.errorText}>{errors.ward.message}</span>}

            {/* Category */}
            <label>Category*</label>
            <select {...register("stakeholder", { required: "Required" })}>
              <option value="">Select Category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.stakeholder && <span className={styles.errorText}>{errors.stakeholder.message}</span>}

            {/* Phone */}
            <label>Phone Number*</label>
            <PhoneInput
              country={"in"}
              value={phone}
              onChange={(value, country) => {
                setPhone(value);
                setCountryCode(country?.countryCode || "");
              }}
              inputStyle={{ width: "100%" }}
            />

            <div className={styles.buttonGroup}>
              <button type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit"}
              </button>
              <button type="button" onClick={onClose}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
