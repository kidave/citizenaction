// components/shared/project/StepContent.js
import { useState } from "react";
import ImageComparison from "components/shared/image/ImageComparison";
import ImageStackPopup from "components/shared/image/ImageStackPopup";
import ImageEmbed from "components/shared/image/ImageEmbed";
import DriveEmbed from "components/shared/ui/DriveEmbed";
import ButtonGroup from "components/shared/ui/ButtonGroup";
import { ImageButton } from "components/shared/ui/Buttons";
import styles from "styles/tabs/project.module.css";

export default function StepContent({ stepKey, project, isCustom = false }) {
  const [popupFiles, setPopupFiles] = useState([]);
  const [beforeIndex, setBeforeIndex] = useState(0);
  const [afterIndex, setAfterIndex] = useState(0);

  const images = project.images?.filter((img) => img.step === stepKey) || [];

  // Get step content based on stepKey
  const getStepContent = (key) => {
    const stepContents = {
      "A": (
        <>
          {project.community_engagement && (
            <>
              <h5>Community Engagement</h5>
              <p>{project.community_engagement}</p>
            </>
          )}
          {project.kickoff_notes && (
            <>
              <h5>Kickoff</h5>
              <p>{project.kickoff_notes}</p>
            </>
          )}
        </>
      ),
      "B": (
        <>
          {project.rationale && (
            <>
              <h5>Rationale</h5>
              <p>{project.rationale}</p>
            </>
          )}
          {project.assessment_tools && (
            <>
              <h5>Assessment Tools</h5>
              <p>{project.assessment_tools}</p>
            </>
          )}
          {project.route_analysis_report && (
            <>
              <h5>Route Analysis</h5>
              <p>{project.route_analysis_report}</p>
            </>
          )}
          {project.wardmap_url && (
            <a href={project.wardmap_url} target="_blank" rel="noopener noreferrer">
              View WardMAP
            </a>
          )}
        </>
      ),
      "C": (
        <>
          {project.coordination_notes && (
            <>
              <h5>Coordination Notes</h5>
              <p>{project.coordination_notes}</p>
            </>
          )}
          {project.agencies_involved && (
            <>
              <h5>Agencies Involved</h5>
              <p>{project.agencies_involved}</p>
            </>
          )}
          {project.commencement_letter_url && (
            <a href={project.commencement_letter_url} target="_blank" rel="noopener noreferrer">
              View Commencement Letter
            </a>
          )}
        </>
      ),
      "D": (
        <>
          {project.progress_notes && (
            <>
              <h5>Progress Notes</h5>
              <p>{project.progress_notes}</p>
            </>
          )}
          {project.execution_details && (
            <>
              <h5>Execution Details</h5>
              <p>{project.execution_details}</p>
            </>
          )}
          {project.documentation_links && (
            <a href={project.documentation_links} target="_blank" rel="noopener noreferrer">
              View Documentation
            </a>
          )}
        </>
      ),
      "E": (
        <>
          {project.learnings && (
            <>
              <h5>Learnings</h5>
              <p>{project.learnings}</p>
            </>
          )}
          {project.community_impact && (
            <>
              <h5>Community Impact</h5>
              <p>{project.community_impact}</p>
            </>
          )}
          {project.final_report_url && (
            <a href={project.final_report_url} target="_blank" rel="noopener noreferrer">
              Download Final Report
            </a>
          )}
        </>
      ),
      "F": (
        <>
          {project.next_route && (
            <>
              <h5>Next Route</h5>
              <p>{project.next_route}</p>
            </>
          )}
          {project.support_to_other_wards && (
            <>
              <h5>Support to Other Wards</h5>
              <p>{project.support_to_other_wards}</p>
            </>
          )}
          {project.legacy_notes && (
            <>
              <h5>Legacy Notes</h5>
              <p>{project.legacy_notes}</p>
            </>
          )}
        </>
      )
    };
    
    return stepContents[key] || null;
  };

  const stepContent = getStepContent(stepKey);

  // Separate single image for side display (first image of type "image")
  const sideImage = images.find((img) => img.type === "image");
  
  // Filter out the side image from other media
  const otherImages = images.filter((img) => img !== sideImage);

  const stacks = otherImages.filter((img) => img.type === "stack");
  const before = otherImages.filter((img) => img.type === "comparison-before");
  const after = otherImages.filter((img) => img.type === "comparison-after");
  const documents = otherImages.filter((img) => img.type === "document");
  const singleImages = otherImages.filter((img) => img.type === "image");
  const driveLinks = otherImages.filter((img) => img.type === "drive-link");

  // Check if there's any content to display
  const hasContent = stepContent || sideImage || images.length > 0;
  
  if (!hasContent) return null;

  return (
    <div className={styles.stepMediaContainer}>
      {/* Step Content with Side Image Layout */}
      {(stepContent || sideImage) && (
        <div className={styles.stepContentLayout}>
          {stepContent && (
            <div className={styles.stepTextContent}>
              {stepContent}
            </div>
          )}
          
          {/* Side Image */}
          {sideImage && (
            <div className={styles.stepSideImage}>
              <ImageEmbed 
                src={sideImage.path} 
                alt={sideImage.caption || "Step image"} 
              />
              {sideImage.caption && (
                <p className={styles.imageCaption}>{sideImage.caption}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Rest of the step media (full width) */}
      {(stacks.length > 0 || before.length > 0 || after.length > 0 || 
        documents.length > 0 || singleImages.length > 0 || driveLinks.length > 0) && (
        <div className={styles.stepMedia}>
          {/* Single Images (excluding the side image) */}
          {singleImages.length > 0 && (
            <div className={styles.singleImages}>
              {singleImages.map((img, idx) => (
                <div key={idx} className={styles.singleImageItem}>
                  <ImageEmbed src={img.path} alt={img.caption || "Image"} />
                  {img.caption && <p className={styles.imageCaption}>{img.caption}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Stacked Images */}
          {stacks.length > 0 && (
            <ButtonGroup>
              <ImageButton
                onClick={() => setPopupFiles(stacks.map((img) => img.path))}
              >
                View Stack ({stacks.length})
              </ImageButton>
              {popupFiles.length > 0 && (
                <ImageStackPopup files={popupFiles} onClose={() => setPopupFiles([])} />
              )}
            </ButtonGroup>
          )}

          {/* Before / After */}
          {(before.length > 0 || after.length > 0) && (
            <ImageComparison
              beforeImages={before.map((img) => img.path)}
              afterImages={after.map((img) => img.path)}
              beforeIndex={beforeIndex}
              afterIndex={afterIndex}
              onBeforeIndexChange={setBeforeIndex}
              onAfterIndexChange={setAfterIndex}
            />
          )}

          {/* Google Drive Embeds */}
          {driveLinks.length > 0 && (
            <div className={styles.driveLinksSection}>
              <h5>Drive Links</h5>
              {driveLinks.map((d, idx) => (
                <DriveEmbed key={idx} driveLink={d.path} title={d.caption || "Document"} />
              ))}
            </div>
          )}

          {/* Document Links */}
          {documents.length > 0 && (
            <div className={styles.documentsSection}>
              {documents.map((doc, idx) => (
                <a
                  key={idx}
                  href={doc.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.documentLink}
                >
                  {doc.caption || `View Document ${idx + 1}`}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}