import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../../../styles/Admin.module.css';

export default function EditFAQ() {
  const [faq, setFaq] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      const initializeData = async () => {
        await checkAuth();
        await fetchFaq();
      };
      initializeData();
    }
  }, [id]);

  const checkAuth = useCallback(async () => {
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
  }, [router]);

  const fetchFaq = useCallback(async () => {
    try {
      const res = await fetch(`/api/faqs/${id}`);
      if (res.ok) {
        const faqData = await res.json();
        setFaq(faqData);
        setQuestion(faqData.question);
        setAnswer(faqData.answer);
        setCategory(faqData.category);
        setTags(faqData.tags.join(', '));
      } else {
        router.push('/admin/dashboard');
      }
    } catch (error) {
      router.push('/admin/dashboard');
    }
  }, [id, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/faqs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          answer,
          category,
          tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        }),
      });

      if (res.ok) {
        router.push('/admin/dashboard');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update FAQ');
      }
    } catch (error) {
      setError('Failed to update FAQ');
    }

    setLoading(false);
  };

  if (!faq) {
    return <div className={styles.loading}>Loading FAQ...</div>;
  }

  return (
    <>
      <Head>
        <title>Edit FAQ - Admin Dashboard</title>
      </Head>

      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Edit FAQ</h1>
          <Link href="/admin/dashboard">← Back to Dashboard</Link>
        </header>

        <main className={styles.main}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.field}>
              <label htmlFor="question">Question *</label>
              <input
                type="text"
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="answer">Answer *</label>
              <textarea
                id="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                required
                rows="6"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="category">Category *</label>
              <input
                type="text"
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="tags">Tags</label>
              <input
                type="text"
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Enter tags separated by commas"
              />
            </div>

            <button type="submit" disabled={loading} className={styles.button}>
              {loading ? 'Updating FAQ...' : 'Update FAQ'}
            </button>
          </form>
        </main>
      </div>
    </>
  );
}