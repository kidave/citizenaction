import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import styles from "styles/components/form.module.css";
import { StakeholderService } from "data/stakeholder";
import Modal from "components/shared/ui/ModalForm";
import { useCommitteeForm } from "hooks/useCommitteeForm";
import FormPhoneInput from "components/shared/ui/FormPhoneInput";
import SuccessAlert from "components/shared/ui/SuccessAlert";

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
      phone: "",
      country_code: "91"
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
      phone: data.phone,
      country_code: data.country_code
    });

    if (result.success && onSuccess) {
      onSuccess(result.formId);
    }
  };

  const handlePhoneChange = useCallback(
    (phone, country) => {
      setValue("phone", phone, { shouldValidate: true });
      setValue("country_code", country.countryCode, { shouldValidate: true });
      trigger("phone");
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
                  <label htmlFor="phone" className={styles.label}>
                    Phone Number *
                  </label>
                  <FormPhoneInput
                    id="phone"
                    value={watch("phone")}
                    countryCode={watch("country_code")}
                    onChange={handlePhoneChange}
                    error={errors.phone}
                    className={errors.phone ? styles.errorField : ""}
                  />
                  {errors.phone && (
                    <span className={styles.errorText} role="alert">
                      {errors.phone.message}
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
