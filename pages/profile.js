import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';
import FAQCard from '../components/FAQCard';
import UserMenu from '../components/UserMenu';


export default function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const router = useRouter();

  const toggleQuestion = (id) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };


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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
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
            <Link href="/" className={styles.navLink}>← Back to FAQs</Link>
            <Link href="/ask" className={styles.signupButton}>Submit a Question</Link>
            <UserMenu user={profileData?.user} onLogout={handleLogout} />
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
                  <div 
                    key={question._id} 
                    className={`${styles.userQuestionItem} ${expandedQuestions[question._id] ? styles.expanded : ''}`}
                    onClick={() => toggleQuestion(question._id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={styles.questionHeader}>
                      <h3>{question.question}</h3>
                      <div className={styles.statusWrapper}>
                        <span className={`${styles.status} ${styles[question.status]}`}>
                          {question.status}
                        </span>
                        <svg 
                          className={`${styles.menuChevron} ${expandedQuestions[question._id] ? styles.rotated : ''}`}
                          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                          style={{ marginLeft: '1rem' }}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      <strong>Submitted:</strong> {new Date(question.createdAt).toLocaleDateString()}
                    </p>
                    
                    {expandedQuestions[question._id] && (
                      <div className={styles.faqAnswerContainer}>
                        <div className={styles.faqAnswerDivider}></div>
                        <div className={styles.faqAnswerContent}>
                          {question.answer ? (
                            <p>{question.answer}</p>
                          ) : (
                            <p style={{ opacity: 0.7, fontStyle: 'italic' }}>This question is currently being reviewed by our team.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

              </div>
            ) : (
              <p>You haven&apos;t submitted any questions yet. <Link href="/ask">Submit your first question</Link></p>
            )}
          </div>

          <div className={styles.profileSection}>
            <h2>FAQs I Marked as Helpful ({profileData?.helpfulFaqs?.length || 0})</h2>
            {profileData?.helpfulFaqs?.length > 0 ? (
              <div className={styles.faqList}>
                 {profileData.helpfulFaqs.map((faq) => (
                   <FAQCard key={faq._id} faq={faq} />
                 ))}
              </div>
            ) : (
              <p>You haven&apos;t marked any FAQs as helpful yet.</p>
            )}
          </div>
        </main>
      </div>
    </>
  );
} 