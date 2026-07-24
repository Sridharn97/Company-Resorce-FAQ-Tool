import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../../styles/Admin.module.css';

export default function UnhelpfulFaqs() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeData = async () => {
      await checkAuth();
      await fetchUnhelpfulFaqs();
    };
    initializeData();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const userData = await res.json();
        if (userData.user.role !== 'admin') {
          router.push('/');
        }
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchUnhelpfulFaqs = async () => {
    try {
      const res = await fetch('/api/admin/unhelpful-faqs');
      if (res.ok) {
        const data = await res.json();
        setFaqs(data.faqs || []);
      }
    } catch (error) {
      console.error('Failed to fetch unhelpful FAQs:', error);
      setFaqs([]);
    }
    setLoading(false);
  };

  const handleDelete = async (faqId) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      const res = await fetch(`/api/faqs/${faqId}`, { method: 'DELETE' });
      if (res.ok) {
        setFaqs(faqs.filter(faq => faq._id !== faqId));
      } else {
        alert('Failed to delete FAQ');
      }
    } catch (error) {
      alert('Failed to delete FAQ');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Review Unhelpful FAQs - Admin Dashboard</title>
      </Head>

      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Review Unhelpful FAQs</h1>
          <nav className={styles.nav}>
            <Link href="/admin/dashboard">← Back to Dashboard</Link>
          </nav>
        </header>

        <main className={styles.main}>
          <div className={styles.faqList}>
            <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: 'var(--bg-card)', borderRadius: '12px', borderLeft: '4px solid var(--error)' }}>
              <h2 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                Action Required
              </h2>
              <p style={{ color: 'var(--text-light)', marginBottom: 0 }}>
                These FAQs have received negative feedback ("Not Helpful"). Please review them and update their answers to be more clear, or remove them if they are no longer relevant.
              </p>
            </div>

            {faqs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--bg-card)', borderRadius: '12px' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <h3>All Good!</h3>
                <p style={{ color: 'var(--text-light)' }}>There are currently no FAQs with negative feedback to review.</p>
              </div>
            ) : (
              <div className={styles.faqTable}>
                {faqs.map(faq => (
                  <div key={faq._id} className={styles.faqRow}>
                    <div className={styles.faqInfo}>
                      <h3>{faq.question}</h3>
                      <div className={styles.faqMeta}>
                        <span>{faq.category}</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--error)', fontWeight: '600' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm12-7h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path></svg>
                            {faq.helpfulNo} Negative Votes
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--success)' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                            {faq.helpfulYes} Positive Votes
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className={styles.faqActions}>
                      <Link href={`/faq/${faq._id}`}>View Comments & Details</Link>
                      <Link href={`/admin/edit-faq/${faq._id}`}>Edit Content</Link>
                      <button 
                        onClick={() => handleDelete(faq._id)}
                        className={styles.deleteButton}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
