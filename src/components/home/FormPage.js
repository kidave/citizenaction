import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { StakeholderService } from "data/stakeholder";
import { useCommitteeForm } from "hooks/useCommitteeForm";
import FormPhoneInput from "components/shared/ui/FormPhoneInput";
import SuccessAlert from "components/shared/alert/SuccessAlert";
import AuthAlert from "components/shared/alert/AuthAlert";
import styles from "styles/pages/joincommittee.module.css";
import Image from "next/image";
import Spinner from "components/shared/ui/Spinner";

export default function Form() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const { 
    submitForm, 
    loading, 
    error, 
    success, 
    formId, 
    showAuthAlert, 
    closeAuthAlert,
    reset 
  } = useCommitteeForm();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    reset: resetForm,
    setValue,
    watch,
    trigger
  } = useForm({
    mode: "onChange",
    defaultValues: {
      stakeholder: "",
      mobile: "",
      country_code: "91",
      designation: "",
      locality: "",
    }
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = StakeholderService.getStakeholder();
        setCategories(categoriesData);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    resetForm();
    reset();
  }, [resetForm, reset]);

  const handleClose = () => {
    router.push("/");
  };

  const onSubmit = async (data) => {
    const result = await submitForm({
      stakeholder: data.stakeholder,
      mobile: data.mobile,
      country_code: data.country_code,
      designation: data.designation,
      locality: data.locality,
      contribution: data.contribution,
      skills: data.skills,
      expectations: data.expectations
    });

    // Auth requirement is handled by the hook and AuthAlert component
    if (result.success) {
      // Success handled by the SuccessAlert component
    }
  };

  const handleMobileChange = (mobile, country) => {
    setValue("mobile", mobile, { shouldValidate: true });
    setValue("country_code", country.countryCode, { shouldValidate: true });
    trigger("mobile");
  };

  return (
    <div className={styles.formPage}>
      {/* Success Alert */}
      <SuccessAlert
        isOpen={success}
        onClose={handleClose}
        title="Thank you for applying!"
        message="Your application has been submitted successfully. Our team will review your details and get back to you shortly."
        referenceId={formId}
        buttonText="Return to Home"
      />

      {/* Auth Alert */}
      <AuthAlert
        isOpen={showAuthAlert}
        onClose={closeAuthAlert}
        title="Login Required"
        message="Please log in to submit your committee application."
        withBackdrop={true}
      />

      {/* Loading Overlay */}
      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingContent}>
            <Spinner mode="inline" />
            <h3>Submitting your application...</h3>
            <p>Please wait while we process your request.</p>
          </div>
        </div>
      )}

      {/* Main Content with conditional blur */}
      <div className={`${styles.formContainer} ${loading ? styles.blurred : ""}`}>
        
        {/* TOP ROW - Header */}
        <div className={styles.topRow}>
          <div className={styles.contentHeader}>
            <p>Become a part of your <strong>Ward Committee</strong> to create better urban spaces and improving everyday life.</p>
          </div>
          
          {/* Features List - Horizontal Row */}
          <ul className={styles.featuresList}>
            <li>
              <span className={styles.featureIcon}>✓</span>
              <span>Make a real impact in your community</span>
            </li>
            <li>
              <span className={styles.featureIcon}>✓</span>
              <span>Connect with like-minded individuals</span>
            </li>
            <li>
              <span className={styles.featureIcon}>✓</span>
              <span>Participate in community walks and events</span>
            </li>
            <li>
              <span className={styles.featureIcon}>✓</span>
              <span>Help shape sustainable neighborhoods</span>
            </li>
          </ul>
        </div>

        {/* MIDDLE ROW - Left & Right Split */}
        <div className={styles.middleRow}>
          {/* LEFT SIDE - Personal Information */}
          <div className={styles.leftSide}>
            <h3 className={styles.sectionTitle}>Your Details</h3>

            <div className={styles.formGrid}>
              <div className={styles.formSection}>
                <label className={styles.label}>Category *</label>
                <select
                  {...register("stakeholder", { required: "Please select a category" })}
                  className={`${styles.select} ${errors.stakeholder ? styles.errorField : ""}`}
                  disabled={loading}
                >
                  <option value="">Select your category</option>
                  {categories.map(option => (
                    <option key={option.id} value={option.name}>{option.name}</option>
                  ))}
                </select>
                {errors.stakeholder && <span className={styles.errorText}>{errors.stakeholder.message}</span>}
              </div>

              <div className={styles.formSection}>
                <label className={styles.label}>Designation *</label>
                <input
                  type="text"
                  {...register("designation", {
                    required: "Designation is required",
                    minLength: { value: 2, message: "Too short" }
                  })}
                  className={`${styles.input} ${errors.designation ? styles.errorField : ""}`}
                  placeholder="Your role or title"
                  disabled={loading}
                />
                {errors.designation && <span className={styles.errorText}>{errors.designation.message}</span>}
              </div>

              <div className={styles.formSection}>
                <label className={styles.label}>Locality *</label>
                <input
                  type="text"
                  {...register("locality", {
                    required: "Locality is required",
                    minLength: { value: 2, message: "Too short" }
                  })}
                  className={`${styles.input} ${errors.locality ? styles.errorField : ""}`}
                  placeholder="Neighborhood / Area"
                  disabled={loading}
                />
                {errors.locality && <span className={styles.errorText}>{errors.locality.message}</span>}
              </div>
            </div>

            {/* SECTION 2 — Contact */}
            <h3 className={styles.sectionTitle}>Contact</h3>

            <div className={styles.formSection}>
              <label className={styles.label}>Mobile Number *</label>
              <FormPhoneInput
                value={watch("mobile")}
                countryCode={watch("country_code")}
                onChange={handleMobileChange}
                error={errors.mobile}
                disabled={loading}
              />
              {errors.mobile && <span className={styles.errorText}>{errors.mobile.message}</span>}
            </div>
          </div>

          {/* RIGHT SIDE - Application Details */}
          <div className={styles.rightSide}>
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
              {error && !showAuthAlert && (
                <div className={styles.error}>
                  <span className={styles.errorLabel}>Error:</span> {error}
                </div>
              )}

              {/* SECTION 3 — Application Details */}
              <h3 className={styles.sectionTitle}>Your Application</h3>

              <div className={styles.formSection}>
                <label className={styles.label}>How would you like to contribute? *</label>
                <textarea
                  {...register("contribution", {
                    required: "This is required",
                    minLength: { value: 10, message: "Please provide more details" }
                  })}
                  className={`${styles.textarea} ${errors.contribution ? styles.errorField : ""}`}
                  placeholder="Tell us what role you want to play..."
                />
                {errors.contribution && <span className={styles.errorText}>{errors.contribution.message}</span>}
              </div>

              <div className={styles.formSection}>
                <label className={styles.label}>Your expectations from the committee</label>
                <textarea
                  {...register("expectations")}
                  className={styles.textarea}
                  placeholder="Eg: want updates, want to attend walks, want leadership role..."
                />
              </div>

              {/* Buttons */}
              <div className={styles.buttonGroup}>
                <button type="button" onClick={() => router.back()} className={styles.cancelButton}>
                  Cancel
                </button>
                <button type="submit" disabled={!isDirty || !isValid || loading} className={styles.submitButton}>
                  {loading ? <><span className={styles.buttonSpinner}></span>Submitting...</> : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* BOTTOM ROW - Contact Info */}
        <div className={styles.bottomRow}>
          <div className={styles.contactInfo}>
            <div className={styles.logoContainer}>
              <Image 
                src="/wp_icon_sm.avif" 
                alt="Walking Project Logo" 
                width={40}
                height={40}
                className={styles.logo}
              />
              <Image 
                src="/wp_text_logo.avif" 
                alt="Walking Project Text Logo" 
                width={180}
                height={40}
                className={styles.logo}
              />
            </div>
            <p><strong>Questions?</strong> Contact us at info@walkingproject.org</p>
          </div>
        </div>
      </div>
    </div>
  );
}