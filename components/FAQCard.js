import { useState } from 'react';
import styles from '../styles/Home.module.css';

export default function FAQCard({ faq }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = (e) => {
    // Prevent expansion when clicking on tags or links inside (if any)
    if (e.target.closest(`.${styles.tags}`)) return;
    setIsExpanded(!isExpanded);
  };

  return (
    <div 
      className={`${styles.faqCard} ${isExpanded ? styles.expanded : ''}`} 
      onClick={toggleExpand}
      onKeyDown={(e) => e.key === 'Enter' && toggleExpand(e)}
      tabIndex={0} 
      role="button" 
      aria-expanded={isExpanded}
      aria-label={`${isExpanded ? 'Hide' : 'Show'} answer for: ${faq.question}`}
    >
      <div className={styles.faqHeader}>
        <div className={styles.faqContentWrapper}>
          <h3 className={styles.faqCardTitle}>{faq.question}</h3>
          <div className={styles.faqMeta}>
            <span className={styles.category}>{faq.category}</span>
            <span className={styles.views}>{faq.views} views</span>
            <div className={styles.tags}>
              {(faq.tags || []).map(tag => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
        <div className={`${styles.faqChevron} ${isExpanded ? styles.rotated : ''}`}>
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
      
      {isExpanded && (
        <div className={styles.faqAnswerContainer}>
          <div className={styles.faqAnswerDivider}></div>
          <div className={styles.faqAnswerContent}>
            <p>{faq.answer}</p>
          </div>
          {faq.helpfulYes !== undefined && (
            <div className={styles.faqFeedback}>
              <span>Was this helpful?</span>
              <div className={styles.feedbackButtons}>
                <button className={styles.feedbackBtn}>👍 {faq.helpfulYes}</button>
                <button className={styles.feedbackBtn}>👎 {faq.helpfulNo}</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

