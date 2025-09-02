import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "utils/supabaseClient";
import styles from "styles/components/form.module.css";
import { useRouter } from "next/router";
import { useRegionData } from "hooks/useRegionData";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { StakeholderService } from "data/stakeholder";
import Modal from "components/shared/ui/ModalForm";

export default function Form({ show, onClose, onSuccess }) {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("");

  const { divisions, wards, handleDivisionChange } = useRegionData();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  // Load stakeholder categories
  useEffect(() => {
    if (show) {
      setCategories(StakeholderService.getStakeholder());
    }
  }, [show]);

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (!phone) {
      setErrorMsg("Phone number is required");
      setLoading(false);
      return;
    }

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;

      const res = await fetch("/api/user/form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ward_code: data.ward,
          stakeholder_id: parseInt(data.stakeholder),
          phone,
          country_code: countryCode,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Submission failed");

      setSuccessMsg("Application submitted successfully!");
      if (onSuccess) onSuccess();
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onClose={onClose}>
      {loading ? (
        <div className={styles.messageContainer}>
          <h3>Loading...</h3>
        </div>
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
            {divisions.map((d) => (
              <option key={d.code} value={d.code}>
                {d.name}
              </option>
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
            {wards.map((w) => (
              <option key={w.code} value={w.code}>
                {w.name}
              </option>
            ))}
          </select>
          {errors.ward && <span className={styles.errorText}>{errors.ward.message}</span>}

          {/* Category */}
          <label>Category*</label>
          <select {...register("stakeholder", { required: "Required" })}>
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.stakeholder && (
            <span className={styles.errorText}>{errors.stakeholder.message}</span>
          )}

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
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
