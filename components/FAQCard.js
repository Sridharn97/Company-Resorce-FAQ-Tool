import { useState, useEffect } from 'react';
import styles from '../styles/Home.module.css';

export default function FAQCard({ faq, forceExpanded }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Feedback states
  const [helpfulYes, setHelpfulYes] = useState(faq.helpfulYes || 0);
  const [helpfulNo, setHelpfulNo] = useState(faq.helpfulNo || 0);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    if (forceExpanded !== undefined) {
      setIsExpanded(forceExpanded);
    }
  }, [forceExpanded]);

  const toggleExpand = (e) => {
    // Prevent expansion when clicking on tags, buttons, or links inside
    if (e.target.closest(`.${styles.tags}`) || e.target.closest(`.${styles.copyBtn}`) || e.target.closest(`.${styles.faqFeedback}`)) return;
    setIsExpanded(!isExpanded);
  };

  const handleCopy = (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/faq/${faq._id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleFeedback = async (e, helpful) => {
    e.stopPropagation();
    if (feedbackSubmitted) return;
    try {
      const res = await fetch('/api/faqs/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faqId: faq._id, helpful }),
      });

      if (res.ok) {
        const data = await res.json();
        setHelpfulYes(data.helpfulYes);
        setHelpfulNo(data.helpfulNo);
        setFeedbackSubmitted(true);
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const words = (faq.answer || '').trim().split(/\s+/).length;
  const readTime = Math.ceil(words / 200) || 1;

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
            <span className={styles.readTime}>
              <svg 
                width="12" 
                height="12" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className={styles.metaIcon}
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              {readTime} min read
            </span>
            <div className={styles.tags}>
              {(faq.tags || []).map(tag => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
        
        <div className={styles.faqHeaderRight}>
          <button 
            className={`${styles.copyBtn} ${copied ? styles.copyBtnSuccess : ''}`}
            onClick={handleCopy}
            title={copied ? "Copied Link!" : "Copy FAQ Link"}
            aria-label="Copy FAQ Link"
          >
            {copied ? (
              <svg 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : (
              <svg 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            )}
          </button>
          
          <div className={`${styles.faqChevron} ${isExpanded ? styles.rotated : ''}`}>
            <svg 
              width="20" 
              height="20" 
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
      </div>
      
      {isExpanded && (
        <div className={styles.faqAnswerContainer}>
          <div className={styles.faqAnswerDivider}></div>
          <div className={styles.faqAnswerContent}>
            <p>{faq.answer}</p>
          </div>
          {faq.helpfulYes !== undefined && (
            <div className={styles.faqFeedback}>
              {feedbackSubmitted ? (
                <span className={styles.feedbackThanks}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Thanks for your feedback!
                </span>
              ) : (
                <>
                  <span>Was this helpful?</span>
                  <div className={styles.feedbackButtons}>
                    <button 
                      className={styles.feedbackBtn}
                      onClick={(e) => handleFeedback(e, true)}
                    >
                      <svg 
                        width="14" 
                        height="14" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        className={styles.feedbackIcon}
                      >
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                      </svg>
                      {helpfulYes}
                    </button>
                    <button 
                      className={styles.feedbackBtn}
                      onClick={(e) => handleFeedback(e, false)}
                    >
                      <svg 
                        width="14" 
                        height="14" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        className={styles.feedbackIcon}
                      >
                        <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm12-7h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path>
                      </svg>
                      {helpfulNo}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

