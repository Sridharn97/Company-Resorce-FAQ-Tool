import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../../styles/Admin.module.css';

export default function UserQuestions() {
  const [userQuestions, setUserQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);
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
        fetchUserQuestions();
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchUserQuestions = async () => {
    try {
      const res = await fetch('/api/user-questions');
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

  const handleAnswerQuestion = (question) => {
    setSelectedQuestion(question);
    setAnswer(question.answer || '');
    setCategory(question.category || '');
    setTags(question.tags ? question.tags.join(', ') : '');
    setShowAnswerForm(true);
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/user-questions?id=${selectedQuestion._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answer: answer.trim(),
          category: category.trim(),
          tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        })
      });

      if (res.ok) {
        const updatedQuestion = await res.json();
        setUserQuestions(prev => 
          prev.map(q => q._id === selectedQuestion._id ? updatedQuestion.userQuestion : q)
        );
        setShowAnswerForm(false);
        setSelectedQuestion(null);
        setAnswer('');
        setCategory('');
        setTags('');
      } else {
        const error = await res.json();
        setError(error.error || 'Failed to answer question');
      }
    } catch (error) {
      setError('Failed to answer question');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConvertToFaq = async (question) => {
    if (!question.answer) {
      setError('Question must be answered before converting to FAQ');
      return;
    }

    if (!confirm('Are you sure you want to convert this question to an FAQ?')) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/user-questions?id=${question._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: question.category || 'General',
          tags: question.tags || []
        })
      });

      if (res.ok) {
        const result = await res.json();
        setUserQuestions(prev => 
          prev.map(q => q._id === question._id ? result.userQuestion : q)
        );
        alert('Question converted to FAQ successfully!');
      } else {
        const error = await res.json();
        setError(error.error || 'Failed to convert question to FAQ');
      }
    } catch (error) {
      setError('Failed to convert question to FAQ');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return styles.pending;
      case 'answered': return styles.answered;
      case 'converted': return styles.converted;
      default: return '';
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
          {error && (
            <div className={styles.error} onClick={() => setError('')}>
              {error} (click to dismiss)
            </div>
          )}

          <div className={styles.userQuestionsList}>
            {userQuestions.length === 0 ? (
              <p>No user questions found.</p>
            ) : (
              userQuestions.map((question) => (
                <div key={question._id} className={styles.userQuestionItem}>
                  <div className={styles.questionHeader}>
                    <h3>{question.name} ({question.email})</h3>
                    <span className={`${styles.status} ${getStatusColor(question.status)}`}>
                      {question.status}
                    </span>
                  </div>
                  <p><strong>Question:</strong> {question.question}</p>
                  <p><strong>Submitted:</strong> {new Date(question.createdAt).toLocaleDateString()}</p>
                  
                  {question.answer && (
                    <div className={styles.answerSection}>
                      <p><strong>Answer:</strong> {question.answer}</p>
                      {question.category && <p><strong>Category:</strong> {question.category}</p>}
                      {question.tags && question.tags.length > 0 && (
                        <p><strong>Tags:</strong> {question.tags.join(', ')}</p>
                      )}
                      {question.answeredAt && (
                        <p><strong>Answered:</strong> {new Date(question.answeredAt).toLocaleDateString()}</p>
                      )}
                    </div>
                  )}

                  <div className={styles.questionActions}>
                    {question.status === 'pending' && (
                      <button 
                        onClick={() => handleAnswerQuestion(question)}
                        className={styles.answerButton}
                      >
                        Answer Question
                      </button>
                    )}
                    
                    {question.status === 'answered' && (
                      <>
                        <button 
                          onClick={() => handleAnswerQuestion(question)}
                          className={styles.editButton}
                        >
                          Edit Answer
                        </button>
                        <button 
                          onClick={() => handleConvertToFaq(question)}
                          className={styles.convertButton}
                          disabled={submitting}
                        >
                          Convert to FAQ
                        </button>
                      </>
                    )}

                    {question.status === 'converted' && (
                      <span className={styles.convertedText}>
                        ✓ Converted to FAQ
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {showAnswerForm && selectedQuestion && (
            <div className={styles.modalOverlay}>
              <div className={styles.modal}>
                <h3>Answer Question</h3>
                <form onSubmit={handleSubmitAnswer}>
                  <div>
                    <label>Answer:</label>
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      required
                      rows={6}
                      placeholder="Provide a detailed answer..."
                    />
                  </div>
                  
                  <div>
                    <label>Category:</label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g., General, Technical, HR"
                    />
                  </div>
                  
                  <div>
                    <label>Tags (comma-separated):</label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="e.g., setup, troubleshooting, policy"
                    />
                  </div>
                  
                  <div className={styles.modalActions}>
                    <button 
                      type="submit" 
                      disabled={submitting}
                      className={styles.submitButton}
                    >
                      {submitting ? 'Submitting...' : 'Submit Answer'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setShowAnswerForm(false)}
                      className={styles.cancelButton}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
} 