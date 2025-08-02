import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../../styles/FAQ.module.css';

export default function FAQPage() {
  const [faq, setFaq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
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
          <Link href="/">← Back to FAQs</Link>
        </header>

        <main className={styles.main}>
          <div className={styles.faqContent}>
            <h1>{faq.question}</h1>
            
            <div className={styles.faqMeta}>
              <span className={styles.category}>{faq.category}</span>
              <span className={styles.views}>{faq.views} views</span>
              <div className={styles.tags}>
                {faq.tags.map(tag => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
            </div>

            <div className={styles.timestamps}>
              <p><strong>Created:</strong> {new Date(faq.createdAt).toLocaleDateString()} at {new Date(faq.createdAt).toLocaleTimeString()}</p>
            </div>

            <div className={styles.answer}>
              <p>{faq.answer}</p>
            </div>

            <div className={styles.feedback}>
              <h3>Was this helpful?</h3>
              {feedbackSubmitted ? (
                <p className={styles.feedbackThanks}>Thanks for your feedback!</p>
              ) : (
                <div className={styles.feedbackButtons}>
                  <button 
                    onClick={() => handleFeedback(true)}
                    className={styles.yesButton}
                  >
                    👍 Yes ({faq.helpfulYes})
                  </button>
                  <button 
                    onClick={() => handleFeedback(false)}
                    className={styles.noButton}
                  >
                    👎 No ({faq.helpfulNo})
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