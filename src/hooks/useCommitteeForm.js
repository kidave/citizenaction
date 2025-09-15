// hooks/useCommitteeForm.js
import { useState, useCallback } from "react";
import { supabase } from "utils/supabaseClient";

export const useCommitteeForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formId, setFormId] = useState(null);

  const submitForm = useCallback(async (formData) => {
    setLoading(true);
    setError("");
    setSuccess(false);
    setFormId(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        throw new Error("Not authenticated. Please log in again.");
      }

      const res = await fetch("/api/user/form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || "Submission failed. Please try again.");
      }

      setSuccess(true);
      setFormId(result.form_id);
      return { success: true, formId: result.form_id, message: result.message };
    } catch (err) {
      const errorMessage = err.message || "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError("");
    setSuccess(false);
    setFormId(null);
  }, []);

  return { 
    submitForm, 
    loading, 
    error, 
    success, 
    formId,
    reset 
  };
};