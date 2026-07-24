import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../../styles/FAQ.module.css';
import FAQCard from '../../components/FAQCard';

export default function FAQPage({ initialFaq, relatedFaqs }) {
  const [faq, setFaq] = useState(initialFaq);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Comments and User state
  const [user, setUser] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const userData = await res.json();
          setUser(userData.user);
        }
      } catch (error) {
        // Not logged in
      }
    };
    fetchUser();
  }, []);

  const handleFeedback = async (helpful) => {
    try {
      const res = await fetch('/api/faqs/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faqId: faq._id, helpful }),
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

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/faqs/${faq._id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commentText }),
      });

      if (res.ok) {
        const data = await res.json();
        setFaq(prev => ({
          ...prev,
          comments: [...(prev.comments || []), data.comment]
        }));
        setCommentText('');
      } else {
        alert('Failed to submit comment.');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred.');
    }
    setSubmittingComment(false);
  };

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
                {(faq.tags || []).map(tag => (
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
                    Yes ({faq.helpfulYes || 0})
                  </button>
                  <button 
                    onClick={() => handleFeedback(false)}
                    className={styles.noButton}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm12-7h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path>
                    </svg>
                    No ({faq.helpfulNo || 0})
                  </button>
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className={styles.commentsSection} style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
              <h2>Comments & Clarifications</h2>
              <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>Ask for clarification or provide extra context.</p>

              <div className={styles.commentsList}>
                {(faq.comments || []).length === 0 ? (
                  <p style={{ color: 'var(--text-light)', fontStyle: 'italic', marginBottom: '1.5rem' }}>No comments yet. Be the first!</p>
                ) : (
                  (faq.comments || []).map((comment, index) => (
                    <div key={index} className={styles.commentItem} style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <div className={styles.commentHeader} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                        <span style={{ fontWeight: '600', color: 'var(--text)' }}>
                          {comment.user?.name || comment.user?.email || 'Unknown User'}
                          {comment.user?.role === 'admin' && (
                            <span style={{ marginLeft: '8px', padding: '2px 6px', backgroundColor: 'var(--primary)', color: 'white', fontSize: '0.75rem', borderRadius: '4px' }}>Admin</span>
                          )}
                        </span>
                        <span style={{ color: 'var(--text-light)' }}>{new Date(comment.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p style={{ margin: 0, color: 'var(--text)' }}>{comment.text}</p>
                    </div>
                  ))
                )}
              </div>

              {user ? (
                <form onSubmit={submitComment} style={{ marginTop: '1.5rem' }}>
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text)', minHeight: '80px', marginBottom: '1rem', fontFamily: 'inherit' }}
                    required
                  ></textarea>
                  <button 
                    type="submit" 
                    disabled={submittingComment}
                    style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: submittingComment ? 'not-allowed' : 'pointer', fontWeight: '500' }}
                  >
                    {submittingComment ? 'Posting...' : 'Post Comment'}
                  </button>
                </form>
              ) : (
                <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 1rem 0' }}>Please log in to post a comment.</p>
                  <Link href="/login" style={{ display: 'inline-block', padding: '0.5rem 1rem', backgroundColor: 'var(--primary)', color: 'white', textDecoration: 'none', borderRadius: '6px', fontWeight: '500' }}>
                    Log In
                  </Link>
                </div>
              )}
            </div>

            {/* Related FAQs Section */}
            {relatedFaqs && relatedFaqs.length > 0 && (
              <div className={styles.relatedSection} style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
                <h2>Related FAQs</h2>
                <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
                  {relatedFaqs.map(rFaq => (
                    <FAQCard key={rFaq._id} faq={rFaq} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.params;

  try {
    const baseUrl = process.env.NEXTAUTH_URL || `http://${context.req.headers.host}`;
    const res = await fetch(`${baseUrl}/api/faqs/${id}`);

    if (!res.ok) {
      return { notFound: true };
    }

    const data = await res.json();

    return {
      props: {
        initialFaq: data.faq || data, // Handle both old and new API formats just in case
        relatedFaqs: data.relatedFaqs || [],
      },
    };
  } catch (error) {
    return { notFound: true };
  }
}