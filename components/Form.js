import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { supabase } from '../utils/supabaseClient';
import styles from "../styles/components/form.module.css";
import PhoneInput from 'react-phone-input-2';
import { FaUserPlus } from "react-icons/fa";

export default function Form() {
  const [wards, setWards] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { register, handleSubmit, reset, formState: { errors }, control } = useForm();

  useEffect(() => {
    async function fetchWards() {
      const { data, error } = await supabase.from('ward').select('code, name');
      if (!error) setWards(data || []);
    }
    fetchWards();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg('');

    // Extract country code and local number
    const phoneValue = data.phone;
    const match = phoneValue.match(/^(\d{1,4})(\d{10})$/);
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
      alert('Application submitted! We will contact you soon.');
      setShowForm(false);
      reset();
    } else {
      console.error(error);
      setErrorMsg("Submission failed. Please try again.");
    }
  };

  return (
    <>
      {/* Floating Apply Button */}
      {!showForm && (
        <button
          className={styles.applyFloatingBtn}
          onClick={() => setShowForm(true)}
          aria-label="Apply"
        >
          <FaUserPlus />
        </button>
      )}

      {/* Modal Overlay with Blur */}
      {showForm && (
        <div className={styles.formOverlay} onClick={() => setShowForm(false)}>
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
                {errors.first_name && <span style={{color:"red"}}>First name is required</span>}
              </label>
              <label>
                Last Name*
                <input
                  type="text"
                  {...register("last_name", { required: true })}
                />
                {errors.last_name && <span style={{color:"red"}}>Last name is required</span>}
              </label>
              <label>
                Email*
                <input
                  type="email"
                  {...register("email", { required: true })}
                />
                {errors.email && <span style={{color:"red"}}>Email is required</span>}
              </label>
              <label>
                Phone*
                <Controller
                  name="phone"
                  control={control}
                  rules={{
                    required: true,
                    validate: value => {
                      const local = value.replace(/^\+?91/, '').replace(/\D/g, '');
                      return local.length === 10;
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
                {errors.phone && <span style={{color:"red"}}>Enter a valid 10-digit phone number</span>}
              </label>
              <label>
                Which ward do you want to support?*
                <select {...register("ward", { required: true })}>
                  <option value="">Select Ward</option>
                  {wards.map(w => (
                    <option key={w.code} value={w.code}>{w.name}</option>
                  ))}
                </select>
                {errors.ward && <span style={{color:"red"}}>Ward is required</span>}
              </label>
              <label>
                Role*
                <select {...register("role", { required: true })}>
                  <option value="">Select Role</option>
                  <option value="member">Member</option>
                  <option value="convener">Convener</option>
                  <option value="co-convener">Co-Convener</option>
                </select>
                {errors.role && <span style={{color:"red"}}>Role is required</span>}
              </label>
              <label>
                Experience / Motivation
                <textarea
                  {...register("experience")}
                  rows={3}
                  placeholder="Tell us about your experience or motivation (optional)"
                />
              </label>
              <label>
                Your Goal?
                <textarea
                  {...register("help")}
                  rows={3}
                  placeholder="Tell us how would you like to support the Walking Project"
                />
                {errors.help && <span style={{color:"red"}}></span>}
              </label>
              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <button type="submit" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Application"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} disabled={loading}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}