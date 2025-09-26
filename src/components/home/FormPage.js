import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { StakeholderService } from "data/stakeholder";
import { useCommitteeForm } from "hooks/useCommitteeForm";
import FormPhoneInput from "components/shared/ui/FormPhoneInput";
import SuccessAlert from "components/shared/alert/SuccessAlert";
import AuthAlert from "components/shared/alert/AuthAlert"; // Import AuthAlert
import styles from "styles/pages/joincommittee.module.css";
import Image from "next/image";

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
        const categoriesData = await StakeholderService.getStakeholder();
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
      stakeholder_id: parseInt(data.stakeholder),
      mobile: data.mobile,
      country_code: data.country_code,
      designation: data.designation,
      locality: data.locality,
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
            <div className={styles.spinner}></div>
            <h3>Submitting your application...</h3>
            <p>Please wait while we process your request.</p>
          </div>
        </div>
      )}

      {/* Main Content with conditional blur */}
      <div className={`${styles.formContainer} ${loading ? styles.blurred : ""}`}>
        {/* Left Side - Improved Content */}
        <div className={styles.contentSide}>
          <div className={styles.logoContainer}>
            <Image 
              src="/wp_icon_sm.png" 
              alt="Walking Project Logo" 
              width={40}
              height={40}
              className={styles.logo}
            />
            <Image 
              src="/wp_text_logo.png" 
              alt="Walking Project Text Logo" 
              width={180}
              height={40}
              className={styles.logo}
            />
          </div>
          
          <div className={styles.contentHeader}>
            <p>Become a part of your <strong>Ward Committee</strong> to improve walkability and create better urban spaces.</p>
          </div>
          
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
              <span>Help shape walkable, sustainable neighborhoods</span>
            </li>
          </ul>
          
          <div className={styles.contactInfo}>
            <p><strong>Questions?</strong> Contact us at info@walkingproject.org</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className={styles.formSide}>
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            {error && !showAuthAlert && (
              <div className={styles.error}>
                <span className={styles.errorLabel}>Error:</span> {error}
              </div>
            )}

            <div className={styles.formGrid}>
              <div className={styles.formSection}>
                <label htmlFor="stakeholder" className={styles.label}>
                  Category *
                </label>
                <select
                  id="stakeholder"
                  {...register("stakeholder", {
                    required: "Please select a category"
                  })}
                  className={`${styles.select} ${
                    errors.stakeholder ? styles.errorField : ""
                  }`}
                  aria-invalid={errors.stakeholder ? "true" : "false"}
                  disabled={loading}
                >
                  <option value="">Select your category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.stakeholder && (
                  <span className={styles.errorText} role="alert">
                    {errors.stakeholder.message}
                  </span>
                )}
              </div>

              <div className={styles.formSection}>
                <label htmlFor="mobile" className={styles.label}>
                  Mobile Number *
                </label>
                <FormPhoneInput
                  id="mobile"
                  value={watch("mobile")}
                  countryCode={watch("country_code")}
                  onChange={handleMobileChange}
                  error={errors.mobile}
                  className={errors.mobile ? styles.errorField : ""}
                  disabled={loading}
                />
                {errors.mobile && (
                  <span className={styles.errorText} role="alert">
                    {errors.mobile.message}
                  </span>
                )}
              </div>

              <div className={styles.formSection}>
                <label htmlFor="designation" className={styles.label}>
                  Designation *
                </label>
                <input
                  id="designation"
                  type="text"
                  {...register("designation", {
                    required: "Designation is required",
                    minLength: {
                      value: 2,
                      message: "Designation must be at least 2 characters"
                    },
                    maxLength: {
                      value: 100,
                      message: "Designation must be less than 100 characters"
                    }
                  })}
                  className={`${styles.input} ${
                    errors.designation ? styles.errorField : ""
                  }`}
                  placeholder="Enter your designation"
                  aria-invalid={errors.designation ? "true" : "false"}
                  disabled={loading}
                />
                {errors.designation && (
                  <span className={styles.errorText} role="alert">
                    {errors.designation.message}
                  </span>
                )}
              </div>

              <div className={styles.formSection}>
                <label htmlFor="locality" className={styles.label}>
                  Locality *
                </label>
                <input
                  id="locality"
                  type="text"
                  {...register("locality", {
                    required: "Locality is required",
                    minLength: {
                      value: 2,
                      message: "Locality must be at least 2 characters"
                    },
                    maxLength: {
                      value: 100,
                      message: "Locality must be less than 100 characters"
                    }
                  })}
                  className={`${styles.input} ${
                    errors.locality ? styles.errorField : ""
                  }`}
                  placeholder="Enter your locality"
                  aria-invalid={errors.locality ? "true" : "false"}
                  disabled={loading}
                />
                {errors.locality && (
                  <span className={styles.errorText} role="alert">
                    {errors.locality.message}
                  </span>
                )}
              </div>
            </div>

            <div className={styles.buttonGroup}>
              <button
                type="button"
                onClick={() => router.back()}
                className={styles.cancelButton}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !isDirty || !isValid}
                className={styles.submitButton}
              >
                {loading ? (
                  <>
                    <span className={styles.buttonSpinner}></span>
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}