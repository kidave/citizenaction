import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { supabase } from '../utils/supabaseClient';
import styles from "../styles/components/form.module.css";
import PhoneInput from 'react-phone-input-2';
// FaUserPlus remains removed from here, as the floating button is managed in index.js

export default function Form({ show, onClose, defaultWard, defaultRole }) {
  const [wards, setWards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const { register, handleSubmit, reset, formState: { errors }, control } = useForm({
    defaultValues: {
      ward: defaultWard || '',
      role: defaultRole || ''
    }
  });

  useEffect(() => {
    // Fetch wards data from Supabase once on component mount
    async function fetchWards() {
      const { data, error } = await supabase.from('ward').select('code, name');
      if (!error) {
        setWards(data || []);
      } else {
        console.error("Error fetching wards:", error);
        setErrorMsg("Failed to load ward options.");
      }
    }
    fetchWards();
  }, []); // Empty dependency array means this runs once on mount


  useEffect(() => {
      async function fetchCategories() {
        const { data, error } = await supabase
          .from('stakeholder_category')
          .select('id, name')
          .order('name', { ascending: true });

        if (!error) {
          setCategories(data || []);
        } else {
          console.error("Error fetching stakeholder categories:", error);
        }
      }

      fetchCategories();
    }, []);



  useEffect(() => {
    // Reset form fields when the form is shown OR when wards data becomes available
    // Adding 'wards' to dependencies ensures the dropdown can correctly pick the defaultWard
    if (show) { // Only reset if the form is shown
      reset({
        ward: defaultWard || '',
        role: defaultRole || '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        category: '',
        designation: ''
      });
      setShowSuccessMessage(false); // Ensure success message is hidden when opening the form
    } else {
      // If the form is closed, reset it completely for the next opening
      reset({
        ward: defaultWard || '',
        role: defaultRole || '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        category: '',
        designation: ''
      });
      setShowSuccessMessage(false); // Ensure success message is hidden when closing the form
    }
  }, [show, defaultWard, defaultRole, reset]); // Removed 'wards' from dependency array for reset on show, as wards state update might trigger reset unnecessarily. Default values will be set on first render via useForm, and then on 'show' prop changes.

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg('');

    // Extract country code and local number from phone input
    const phoneValue = data.phone;
    const match = phoneValue.match(/^(\d{1,4})(\d{10})$/); // Basic regex for [country code][10 digits]
    let country_code = '';
    let phone = '';
    if (match) {
      country_code = '+' + match[1];
      phone = match[2];
    } else {
      phone = phoneValue;
    }

    const submitData = {
      ...data,
      country_code,
      phone
    };

    const { error } = await supabase.from('committee_form').insert([submitData]);
    setLoading(false);

    

    


    if (!error) {
      setShowSuccessMessage(true); // Show success message
      // Automatically close the success message and the form after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
        onClose(); // Close the main form modal
        reset(); // Reset the form after successful submission and closure
      }, 3000);
    } else {
      console.error("Submission failed:", error);
      setErrorMsg("Submission failed. Please try again: " + error.message); // Show more specific error
    }
  };

  return (
    <>
      {/* Modal Overlay with Blur for the Form */}
      {show && (
        <div className={styles.formOverlay} onClick={onClose}>
          <div className={styles.formModal} onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
              <h3>Apply as Member / Convener / Co-Convener</h3>
              {errorMsg && <div style={{ color: "red", marginBottom: 8 }}>{errorMsg}</div>}
              <label>
                First Name*
                <input
                  type="text"
                  {...register("first_name", { required: true })}
                />
                {errors.first_name && <span style={{ color: "red" }}>First name is required</span>}
              </label>
              <label>
                Last Name*
                <input
                  type="text"
                  {...register("last_name", { required: true })}
                />
                {errors.last_name && <span style={{ color: "red" }}>Last name is required</span>}
              </label>
              <label>
                Email*
                <input
                  type="email"
                  {...register("email", { required: true, pattern: /^\S+@\S+\.\S+$/ })} // Added basic email pattern validation
                />
                {errors.email && <span style={{ color: "red" }}>Enter a valid email address</span>}
              </label>
              <label>
                Phone*
                <Controller
                  name="phone"
                  control={control}
                  rules={{
                    required: "Phone number is required",
                    validate: value => {
                      const local = value ? value.replace(/^\+?91/, '').replace(/\D/g, '') : '';
                      return local.length === 10 || "Enter a valid 10-digit phone number";
                    }
                  }}
                  render={({ field }) => (
                    <PhoneInput
                      country={'in'}
                      value={field.value}
                      onChange={field.onChange}
                      inputProps={{
                        name: 'phone',
                        required: true,
                        autoFocus: false
                      }}
                      inputStyle={{ width: '100%' }}
                    />
                  )}
                />
                {errors.phone && <span style={{ color: "red" }}>{errors.phone.message}</span>}
              </label>
              <label>
                Which ward do you want to support?*
                <select {...register("ward", { required: true })} disabled={!!defaultWard}>
                  <option value="">Select Ward</option>
                  {wards.map(w => (
                    <option key={w.code} value={w.code}>{w.name}</option>
                  ))}
                </select>
                {errors.ward && <span style={{ color: "red" }}>Ward is required</span>}
              </label>
              <label>
                Role*
                <select {...register("role", { required: true })} disabled={!!defaultRole}>
                  <option value="">Select Role</option>
                  <option value="member">Member</option>
                  <option value="convener">Convener</option>
                  <option value="co-convener">Co-Convener</option>
                </select>
                {errors.role && <span style={{ color: "red" }}>Role is required</span>}
              </label>
              <label>
                Category*
                <select {...register("category", { required: true })}>
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                {errors.category && <span style={{ color: "red" }}>Category is required</span>}
              </label>
              <label>
                Your Designation
                <textarea
                  {...register("designation")}
                  rows={3}
                  placeholder="Designation (optional)"
                />
                {errors.designation && <span style={{ color: "red" }}>{errors.designation.message}</span>}
              </label>
              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <button type="submit" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Application"}
                </button>
                <button type="button" onClick={onClose}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Message Overlay */}
      {showSuccessMessage && (
        <div className={styles.formOverlay} onClick={() => { setShowSuccessMessage(false); onClose(); }}>
          <div className={styles.formModal} onClick={e => e.stopPropagation()} style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f0fdf4', border: '1px solid #a7f3d0', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <h3 style={{ color: '#047857', marginBottom: '1rem' }}>Application Submitted Successfully!</h3>
            <p style={{ color: '#065f46', fontSize: '1.1rem' }}>We will contact you soon.</p>
            <button
              onClick={() => { setShowSuccessMessage(false); onClose(); }}
              style={{
                marginTop: '1.5rem',
                padding: '0.7rem 1.5rem',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                boxShadow: '0 2px 8px rgba(16,185,129,0.2)',
                transition: 'background-color 0.2s, box-shadow 0.2s'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
