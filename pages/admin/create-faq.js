import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../../styles/Admin.module.css';

export default function CreateFAQ() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/faqs', {
        method: 'POST',
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
        setError(data.error || 'Failed to create FAQ');
      }
    } catch (error) {
      setError('Failed to create FAQ');
    }

    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Create FAQ - Admin Dashboard</title>
      </Head>

      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Create New FAQ</h1>
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
                placeholder="Enter the FAQ question"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="answer">Answer *</label>
              <textarea
                id="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                required
                placeholder="Enter the detailed answer"
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
                placeholder="e.g., HR, IT, General"
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
              <small>Example: benefits, vacation, policy</small>
            </div>

            <button type="submit" disabled={loading} className={styles.button}>
              {loading ? 'Creating FAQ...' : 'Create FAQ'}
            </button>
          </form>
        </main>
      </div>
    </>
  );
}