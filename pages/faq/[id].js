import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../../styles/FAQ.module.css';

export default function FAQPage() {
  const [faq, setFaq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchFaq();
    }
  }, [id]);

  const fetchFaq = async () => {
    try {
      const res = await fetch(`/api/faqs/${id}`);
      if (res.ok) {
        const faqData = await res.json();
        setFaq(faqData);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Failed to fetch FAQ:', error);
      router.push('/');
    }
    setLoading(false);
  };

  const handleFeedback = async (helpful) => {
    try {
      const res = await fetch('/api/faqs/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faqId: id, helpful }),
      });

      if (res.ok) {
        const data = await res.json();
        setFaq(prev => ({
          ...prev,
          helpfulYes: data.helpfulYes,
          helpfulNo: data.helpfulNo,
        }));
        setFeedbackSubmitted(true);
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const handleCopy = () => {
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading FAQ...</div>;
  }

  if (!faq) {
    return <div className={styles.error}>FAQ not found</div>;
  }

  return (
    <>
      <Head>
        <title>{faq.question} - Company Resource FAQ</title>
      </Head>

      <div className={styles.container}>
        <header className={styles.header}>
          <Link href="/">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to FAQs
          </Link>
        </header>

        <main className={styles.main}>
          <div className={styles.faqContent}>
            <div className={styles.titleWrapper}>
              <h1>{faq.question}</h1>
              <div className={styles.titleActions}>
                <button 
                  className={styles.copyBtn}
                  onClick={() => window.print()}
                  title="Print / Save as PDF"
                  aria-label="Print FAQ"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                    <rect x="6" y="14" width="12" height="8"></rect>
                  </svg>
                </button>
                <button 
                  className={`${styles.copyBtn} ${copied ? styles.copyBtnSuccess : ''}`}
                  onClick={handleCopy}
                  title={copied ? "Link Copied!" : "Copy Link"}
                  aria-label="Copy Link"
                >
                  {copied ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className={styles.faqMeta}>
              <span className={styles.category}>{faq.category}</span>
              <div className={styles.tags}>
                {faq.tags.map(tag => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
            </div>

            <div className={styles.timestamps}>
              <p>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle', opacity: 0.8 }}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <strong>Created:</strong> {new Date(faq.createdAt).toLocaleDateString()} at {new Date(faq.createdAt).toLocaleTimeString()}
              </p>
            </div>

            <div className={styles.answer}>
              <p>{faq.answer}</p>
            </div>

            <div className={styles.feedback}>
              <h3>Was this helpful?</h3>
              {feedbackSubmitted ? (
                <p className={styles.feedbackThanks}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  Thanks for your feedback!
                </p>
              ) : (
                <div className={styles.feedbackButtons}>
                  <button 
                    onClick={() => handleFeedback(true)}
                    className={styles.yesButton}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                    </svg>
                    Yes ({faq.helpfulYes})
                  </button>
                  <button 
                    onClick={() => handleFeedback(false)}
                    className={styles.noButton}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm12-7h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path>
                    </svg>
                    No ({faq.helpfulNo})
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}