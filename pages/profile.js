import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

export default function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAuthAndFetchProfile();
  }, []);

  const checkAuthAndFetchProfile = async () => {
    try {
      // Check if user is authenticated
      const authRes = await fetch('/api/auth/me');
      if (!authRes.ok) {
        router.push('/login');
        return;
      }

      // Fetch profile data
      const profileRes = await fetch('/api/profile');
      if (profileRes.ok) {
        const data = await profileRes.json();
        setProfileData(data);
      } else {
        setError('Failed to fetch profile data');
      }
    } catch (error) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading profile...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <>
      <Head>
        <title>My Profile - Company Resource FAQ</title>
      </Head>

      <div className={styles.container}>
        <header className={styles.header}>
          <h1>My Profile</h1>
          <nav className={styles.nav}>
            <Link href="/">← Back to FAQs</Link>
            <Link href="/ask">Submit a Question</Link>
          </nav>
        </header>

        <main className={styles.main}>
          <div className={styles.profileSection}>
            <h2>Account Information</h2>
            <p><strong>Email:</strong> {profileData?.user?.email}</p>
            <p><strong>Role:</strong> {profileData?.user?.role}</p>
          </div>

          <div className={styles.profileSection}>
            <h2>My Submitted Questions ({profileData?.userQuestions?.length || 0})</h2>
            {profileData?.userQuestions?.length > 0 ? (
              <div className={styles.userQuestionsList}>
                {profileData.userQuestions.map((question) => (
                  <div key={question._id} className={styles.userQuestionItem}>
                    <div className={styles.questionHeader}>
                      <h3>{question.question}</h3>
                      <span className={`${styles.status} ${styles[question.status]}`}>
                        {question.status}
                      </span>
                    </div>
                    <p><strong>Submitted:</strong> {new Date(question.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>You haven't submitted any questions yet. <Link href="/ask">Submit your first question</Link></p>
            )}
          </div>

          <div className={styles.profileSection}>
            <h2>FAQs I Marked as Helpful ({profileData?.helpfulFaqs?.length || 0})</h2>
            {profileData?.helpfulFaqs?.length > 0 ? (
              <div className={styles.faqList}>
                {profileData.helpfulFaqs.map((faq) => (
                  <Link key={faq._id} href={`/faq/${faq._id}`} className={styles.faqCardLink}>
                    <div className={styles.faqCard}>
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
                  </Link>
                ))}
              </div>
            ) : (
              <p>You haven't marked any FAQs as helpful yet.</p>
            )}
          </div>
        </main>
      </div>
    </>
  );
} 