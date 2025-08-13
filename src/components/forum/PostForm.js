import React from "react";
import styles from "styles/forum/create-post.module.css";

// This is a presentational component. All logic is handled by the usePostForm hook.
export default function PostForm({
  isEditMode,
  title,
  setTitle,
  description,
  setDescription,
  categoryId,
  setCategoryId,
  categories,
  regionCode,
  handleRegionChange,
  regions,
  cityCode,
  handleCityChange,
  cities,
  divisionCode,
  handleDivisionChange,
  divisions,
  wardCode,
  setWardCode,
  wards,
}) {
  return (
    <>
      <div className={styles.formSection}>
        <h2 className={styles.sectionTitle}>Post Details</h2>
        <div className={styles.formGroup}>
          <label htmlFor="title">Post Title*</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
            placeholder="Briefly describe the issue or topic"
          />
          <div className={styles.characterCount}>{title.length}/200</div>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="description">Short Description*</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            maxLength={500}
            rows={3}
            placeholder="A brief summary of your post (max 200 characters)"
          ></textarea>
          <div className={styles.characterCount}>{description.length}/500</div>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="category">Category*</label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            <option value="">Choose a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.formSection}>
        <h2 className={styles.sectionTitle}>Post Content*</h2>
        <div id="editorjs" className={styles.editorContainer}></div>
        <div className={styles.editorTips}>
          <p>
            Tips: Use headers to organize content and add images to illustrate
            the issue.
          </p>
        </div>
      </div>

      <div className={styles.formSection}>
        <h2 className={styles.sectionTitle}>Location Information</h2>
        <p className={styles.sectionSubtitle}>
          Help others understand the post focus is for which region
        </p>
        <div className={styles.locationGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="region">Region*</label>
            <select
              id="region"
              value={regionCode}
              onChange={(e) => handleRegionChange(e.target.value)}
              required
            >
              <option value="">Select Region</option>
              {regions.map((region) => (
                <option key={region.code} value={region.code}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="city">City</label>
            <select
              id="city"
              value={cityCode}
              onChange={(e) => handleCityChange(e.target.value)}
              disabled={!cities.length}
            >
              <option value="">Select City</option>
              {cities.map((city) => (
                <option key={city.code} value={city.code}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="division">Division</label>
            <select
              id="division"
              value={divisionCode}
              onChange={(e) => handleDivisionChange(e.target.value)}
              disabled={!divisions.length}
            >
              <option value="">Select Division</option>
              {divisions.map((div) => (
                <option key={div.code} value={div.code}>
                  {div.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="ward">Ward</label>
            <select
              id="ward"
              value={wardCode}
              onChange={(e) => setWardCode(e.target.value)}
              disabled={!wards.length}
            >
              <option value="">Select Ward</option>
              {wards.map((ward) => (
                <option key={ward.code} value={ward.code}>
                  {ward.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </>
  );
}
