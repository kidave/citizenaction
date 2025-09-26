import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import styles from "styles/components/form.module.css";
import { StakeholderService } from "data/stakeholder";
import Modal from "components/shared/ui/ModalForm";
import { useCommitteeForm } from "hooks/useCommitteeForm";
import FormPhoneInput from "components/shared/ui/FormPhoneInput";
import SuccessAlert from "components/shared/alert/SuccessAlert";

export default function Form({ show, onClose, onSuccess }) {
  const [categories, setCategories] = useState([]);
  const { submitForm, loading, error, success, formId, reset } = useCommitteeForm();

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

    if (show) loadCategories();
  }, [show]);

  useEffect(() => {
    if (show) {
      resetForm();
      reset();
    }
  }, [show, resetForm, reset]);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const onSubmit = async (data) => {
    const result = await submitForm({
      stakeholder_id: parseInt(data.stakeholder),
      mobile: data.mobile,
      country_code: data.country_code,
      designation: data.designation,
      locality: data.locality,
    });

    if (result.success && onSuccess) {
      onSuccess(result.formId);
    }
  };

  const handleMobileChange = useCallback(
    (mobile, country) => {
      setValue("mobile", mobile, { shouldValidate: true });
      setValue("country_code", country.countryCode, { shouldValidate: true });
      trigger("mobile");
    },
    [setValue, trigger]
  );

  if (!show) return null;

  return (
    <Modal show={show} onClose={handleClose} size="lg">
      {loading ? (
        <div className={styles.messageContainer}>
          <div className={styles.spinner}></div>
          <h3>Submitting your application...</h3>
          <p>Please wait while we process your request.</p>
        </div>
      ) : (
        <>
          {/* ✅ Reusable Success Component */}
          <SuccessAlert
            isOpen={success}
            onClose={handleClose}
            title="Thank you for applying!"
            message="Your application has been submitted successfully. Our team will review your details and get back to you shortly."
            referenceId={formId}
            buttonText="Close"
          />

          {!success && (
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
              <div className={styles.formHeader}>
                <h2>Apply to Join Committee</h2>
                <p>Fill out the form below to submit your application</p>
              </div>

              {error && (
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
                    mobile Number *
                  </label>
                  <FormPhoneInput
                    id="mobile"
                    value={watch("mobile")}
                    countryCode={watch("country_code")}
                    onChange={handleMobileChange}
                    error={errors.mobile}
                    className={errors.mobile ? styles.errorField : ""}
                  />
                  {errors.mobile && (
                    <span className={styles.errorText} role="alert">
                      {errors.mobile.message}
                    </span>
                  )}
                </div>

                {/* ✅ Added Designation Input Field */}
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
                  />
                  {errors.designation && (
                    <span className={styles.errorText} role="alert">
                      {errors.designation.message}
                    </span>
                  )}
                </div>

                {/* ✅ Added Locality Input Field */}
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
                  onClick={handleClose}
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
                    "Submit Application"
                  )}
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </Modal>
  );
}