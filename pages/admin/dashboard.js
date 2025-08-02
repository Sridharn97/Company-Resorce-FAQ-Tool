import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../../styles/Admin.module.css';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeData = async () => {
      await checkAuth();
      await fetchFaqs();
    };
    initializeData();
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const userData = await res.json();
        if (userData.user.role !== 'admin') {
          router.push('/');
          return;
        }
        setUser(userData.user);
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    }
  }, [router]);

  const fetchFaqs = useCallback(async () => {
    try {
      const res = await fetch('/api/faqs');
      const data = await res.json();
      setFaqs(data.faqs);
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
    }
    setLoading(false);
  }, []);

  const handleDelete = async (faqId) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) {
      return;
    }

    try {
      const res = await fetch(`/api/faqs/${faqId}`, {
        method: 'DELETE',
      });

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
        <title>Admin Dashboard - Company Resource FAQ</title>
      </Head>

      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Admin Dashboard</h1>
          <nav className={styles.nav}>
            <Link href="/">← Back to FAQs</Link>
            <Link href="/admin/create-faq" className={styles.createButton}>
              Create New FAQ
            </Link>
            <Link href="/admin/user-questions" className={styles.createButton}>
              Review User Questions
            </Link>
          </nav>
        </header>

        <main className={styles.main}>
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <h3>Total FAQs</h3>
              <p>{faqs.length}</p>
            </div>
            <div className={styles.statCard}>
              <h3>Total Views</h3>
              <p>{faqs.reduce((sum, faq) => sum + faq.views, 0)}</p>
            </div>
            <div className={styles.statCard}>
              <h3>Helpful Votes</h3>
              <p>{faqs.reduce((sum, faq) => sum + faq.helpfulYes, 0)}</p>
            </div>
          </div>

          <div className={styles.faqList}>
            <h2>Manage FAQs</h2>
            {faqs.length === 0 ? (
              <p>No FAQs found. <Link href="/admin/create-faq">Create your first FAQ</Link></p>
            ) : (
              <div className={styles.faqTable}>
                {faqs.map(faq => (
                  <div key={faq._id} className={styles.faqRow}>
                    <div className={styles.faqInfo}>
                      <h3>{faq.question}</h3>
                      <div className={styles.faqMeta}>
                        <span>{faq.category}</span>
                        <span>{faq.views} views</span>
                        <span>{faq.helpfulYes}👍 {faq.helpfulNo}👎</span>
                      </div>
                    </div>
                    <div className={styles.faqActions}>
                      <Link href={`/faq/${faq._id}`}>View</Link>
                      <Link href={`/admin/edit-faq/${faq._id}`}>Edit</Link>
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