import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '../styles/Ask.module.css';

export default function AskQuestion() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const [userChecked, setUserChecked] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user && data.user.role === 'admin') {
            router.replace('/');
            return;
          }
        }
      } catch (e) {}
      setUserChecked(true);
    };
    checkUser();
  }, [router]);

  if (!userChecked) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Generate a unique userId for this submission
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const res = await fetch('/api/user-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, question, userId }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Your question has been submitted!');
        setName('');
        setEmail('');
        setQuestion('');
      } else {
        setError(data.error || 'Failed to submit question.');
      }
    } catch (err) {
      setError('Failed to submit question.');
    }
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Ask a Question - Company Resource FAQ</title>
        <meta name="description" content="Submit your question to our FAQ resource team" />
      </Head>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/" className={styles.backLink}>
            ← Back to FAQ
          </Link>
        </div>
        
        <div className={styles.titleSection}>
          <h2>Submit a Question</h2>
          <p>
            Can&apos;t find what you&apos;re looking for? Ask us a question and we&apos;ll get back to you!
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="name">Name *</label>
            <input 
              type="text" 
              id="name"
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
              placeholder="Enter your full name"
            />
          </div>
          
          <div className={styles.field}>
            <label htmlFor="email">Email *</label>
            <input 
              type="email" 
              id="email"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              placeholder="Enter your email address"
            />
          </div>
          
          <div className={styles.field}>
            <label htmlFor="question">Question *</label>
            <textarea 
              id="question"
              value={question} 
              onChange={e => setQuestion(e.target.value)} 
              required 
              rows={6}
              placeholder="Please describe your question in detail..."
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? 'Submitting...' : 'Submit Question'}
          </button>
          
          {success && (
            <div className={styles.successMessage}>
              {success}
            </div>
          )}
          
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}
        </form>
        
        <div className={styles.tipSection}>
          <p>
            💡 <strong>Tip:</strong> Be as specific as possible in your question to help us provide a better answer.
          </p>
        </div>
      </div>
    </>
  );
} 