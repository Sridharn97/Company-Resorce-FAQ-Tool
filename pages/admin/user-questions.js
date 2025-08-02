import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../../styles/Admin.module.css';

export default function UserQuestions() {
  const [userQuestions, setUserQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const [user, setUser] = useState(null);

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
          return;
        }
        setUser(userData.user);
        fetchUserQuestions(userData.user._id);
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchUserQuestions = async (userId) => {
    try {
      const res = await fetch(`/api/user-questions?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setUserQuestions(data);
      } else {
        setError('Failed to fetch user questions');
      }
    } catch (error) {
      setError('Failed to fetch user questions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading user questions...</div>;
  }

  return (
    <>
      <Head>
        <title>User Questions - Admin Dashboard</title>
      </Head>

      <div className={styles.container}>
        <header className={styles.header}>
          <h1>User Questions</h1>
          <Link href="/admin/dashboard">← Back to Dashboard</Link>
        </header>

        <main className={styles.main}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.userQuestionsList}>
            {userQuestions.map((question) => (
              <div key={question._id} className={styles.userQuestionItem}>
                <div className={styles.questionHeader}>
                  <h3>{question.name} ({question.email})</h3>
                  <span className={`${styles.status} ${styles[question.status]}`}>
                    {question.status}
                  </span>
                </div>
                <p><strong>Question:</strong> {question.question}</p>
                <p><strong>Submitted:</strong> {new Date(question.createdAt).toLocaleDateString()}</p>
                {/* No actions, view only */}
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
} 