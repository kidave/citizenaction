import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { supabase } from "../utils/supabaseClient";
import styles from "../styles/components/form.module.css";
import PhoneInput from "react-phone-input-2";
import { useRouter } from "next/router";

export default function Form({ show, onClose, defaultWard, defaultRole }) {
  const router = useRouter();
  const [wards, setWards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [user, setUser] = useState(null);
  const [userDataLoaded, setUserDataLoaded] = useState(false);
  const [hasExistingApplication, setHasExistingApplication] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    control,
  } = useForm({
    defaultValues: {
      ward: defaultWard || "",
      role: defaultRole || "",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      stakeholder: "",
      designation: "",
      avatar_url: "",
    },
  });

  const isMemberForm = defaultRole === "member";

  const handleClose = () => {
    setHasExistingApplication(false);
    setShowSuccessMessage(false);
    setErrorMsg("");
    onClose();
  };

  useEffect(() => {
    if (!show) return;

    (async () => {
      try {
        const sessionRes = await supabase.auth.getSession();
        if (!sessionRes.data.session) {
          alert("Please login to apply.");
          router.push("/auth");
          handleClose();
          return;
        }

        const { data: { user: userData }, error: userError } = await supabase.auth.getUser();
        if (userError || !userData) {
          alert("Could not fetch user. Please re-login.");
          router.push("/auth");
          handleClose();
          return;
        }

        setUser(userData);

        const avatar_url =
          userData.user_metadata?.avatar_url ||
          userData.identities?.[0]?.identity_data?.avatar_url ||
          null;

        const { data: existingApplications, error } = await supabase
          .from("committee_form")
          .select("*")
          .eq("user_id", userData.id)
          .in("application_status", ["Pending", "Approved"]);

        if (error) {
          console.error("Error checking existing applications:", error);
        } else if (existingApplications && existingApplications.length > 0) {
          setHasExistingApplication(true);
          setApplicationStatus(existingApplications[0].application_status);
          return;
        }

        const nameParts =
          userData.user_metadata?.full_name?.split(" ") ||
          userData.identities?.[0]?.identity_data?.full_name?.split(" ") ||
          [];
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";
        const email = userData.email || "";

        reset({
          ward: defaultWard || "",
          role: defaultRole || "",
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: "",
          stakeholder: "",
          designation: "",
          avatar_url: avatar_url,
        });
        setUserDataLoaded(true);
      } catch (error) {
        console.error("Form initialization error:", error);
      }
    })();
  }, [show, reset, defaultWard, defaultRole, router]);

  useEffect(() => {
    async function fetchWards() {
      const { data, error } = await supabase
        .from("ward")
        .select("code")
        .order("name", { ascending: true });
      if (!error) setWards(data || []);
      else console.error("Error fetching wards:", error);
    }
    fetchWards();
  }, []);

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from("stakeholder_category")
        .select("id, name")
        .order("name", { ascending: true });
      if (!error) setCategories(data || []);
      else console.error("Error fetching stakeholder categories:", error);
    }
    fetchCategories();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg("");

    try {
      const phoneValue = data.phone;
      const match = phoneValue.match(/^(\d{1,4})(\d{10})$/);
      let country_code = "";
      let phone = "";
      if (match) {
        country_code = "+" + match[1];
        phone = match[2];
      } else {
        phone = phoneValue;
      }

      const submitData = {
        ...data,
        country_code,
        phone,
        user_id: user?.id,
        avatar_url: data.avatar_url,
        application_status: "Pending",
      };

      const { error } = await supabase
        .from("committee_form")
        .insert([submitData]);

      if (error) throw error;

      setShowSuccessMessage(true);
      setHasExistingApplication(false);
    } catch (error) {
      console.error("Submission failed:", error);
      setErrorMsg("Submission failed. Please try again: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <>
      <div className={styles.formOverlay} onClick={handleClose}>
        <div className={styles.formModal} onClick={(e) => e.stopPropagation()}>
          {hasExistingApplication ? (
            <div style={{ padding: "2rem", textAlign: "center" }}>
              <h3>You've already submitted an application</h3>
              <p>
                Your application is currently: <strong>{applicationStatus}</strong>
              </p>
              <button onClick={handleClose} style={{
                marginTop: "1.5rem",
                padding: "0.7rem 1.5rem",
                backgroundColor: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer"
              }}>
                Close
              </button>
            </div>
          ) : showSuccessMessage ? (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                backgroundColor: "#f0fdf4",
                border: "1px solid #a7f3d0",
                boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              }}
            >
              <h3 style={{ color: "#047857", marginBottom: "1rem" }}>
                Application Submitted Successfully!
              </h3>
              <p style={{ color: "#065f46", fontSize: "1.1rem" }}>
                We will contact you soon.
              </p>
              <button onClick={handleClose} style={{
                marginTop: "1.5rem",
                padding: "0.7rem 1.5rem",
                backgroundColor: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer"
              }}>
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
              <h3>
                {isMemberForm
                  ? "Apply to be a Member"
                  : "Apply to be a Member / Convener / Co-Convener"}
              </h3>

              {errorMsg && <div style={{ color: "red", marginBottom: 8 }}>{errorMsg}</div>}

              <label>
                First Name*
                <input type="text" {...register("first_name", { required: true })} readOnly={userDataLoaded} />
                {errors.first_name && <span style={{ color: "red" }}>First name is required</span>}
              </label>

              <label>
                Last Name*
                <input type="text" {...register("last_name", { required: true })} readOnly={userDataLoaded} />
                {errors.last_name && <span style={{ color: "red" }}>Last name is required</span>}
              </label>

              <label>
                Email*
                <input type="email" {...register("email", { required: true, pattern: /^\S+@\S+\.\S+$/ })} readOnly={userDataLoaded} />
                {errors.email && <span style={{ color: "red" }}>Enter a valid email address</span>}
              </label>

              <label>
                Phone*
                <Controller
                  name="phone"
                  control={control}
                  rules={{
                    required: "Phone number is required",
                    validate: (value) => {
                      const local = value?.replace(/^\+?91/, "").replace(/\D/g, "");
                      return local.length === 10 || "Enter a valid 10-digit phone number";
                    },
                  }}
                  render={({ field }) => (
                    <PhoneInput
                      country={"in"}
                      value={field.value}
                      onChange={field.onChange}
                      inputProps={{ name: "phone", required: true }}
                      inputStyle={{ width: "100%" }}
                    />
                  )}
                />
                {errors.phone && <span style={{ color: "red" }}>{errors.phone.message}</span>}
              </label>

              <label>
                Which ward do you want to support?*
                <select {...register("ward", { required: true })} disabled={!!defaultWard}>
                  <option value="">Select Ward</option>
                  {wards.map((w) => (
                    <option key={w.code} value={w.code}>
                      {w.code}
                    </option>
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
                <select {...register("stakeholder", { required: true })}>
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.stakeholder && <span style={{ color: "red" }}>Category is required</span>}
              </label>

              <label>
                Your Designation
                <textarea {...register("designation")} rows={3} placeholder="Designation (optional)" />
              </label>

              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <button type="submit" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Application"}
                </button>
                <button type="button" onClick={handleClose}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
