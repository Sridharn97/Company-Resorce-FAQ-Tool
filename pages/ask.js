import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

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
      const res = await fetch('/api/user-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, question }),
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
    <div style={{ 
      maxWidth: 600, 
      margin: '2rem auto', 
      padding: '2rem', 
      background: 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(91,134,229,0.1)',
      border: '1px solid #e3e9f7'
    }}>
      <div style={{ 
        textAlign: 'left', 
        marginBottom: '1.5rem',
        borderBottom: '1px solid #e3e9f7',
        paddingBottom: '1rem'
      }}>
        <Link href="/" style={{ 
          color: '#5b86e5', 
          textDecoration: 'none',
          fontSize: '1rem',
          fontWeight: '500',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          ← Back to FAQ
        </Link>
      </div>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ 
          color: '#222b45', 
          fontSize: '2rem', 
          fontWeight: '700',
          marginBottom: '0.5rem'
        }}>Submit a Question</h2>
        <p style={{ 
          color: '#666', 
          fontSize: '1.1rem',
          lineHeight: '1.6'
        }}>
          Can&apos;t find what you&apos;re looking for? Ask us a question and we&apos;ll get back to you!
        </p>
      </div>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: '600',
            color: '#222b45'
          }}>
            Name *
          </label>
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            required 
            style={{ 
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              border: '1.5px solid #e3e9f7',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              transition: 'border 0.2s, box-shadow 0.2s'
            }}
            onFocus={(e) => {
              e.target.style.border = '1.5px solid #36d1c4';
              e.target.style.boxShadow = '0 2px 8px rgba(54,209,196,0.08)';
            }}
            onBlur={(e) => {
              e.target.style.border = '1.5px solid #e3e9f7';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
        
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: '600',
            color: '#222b45'
          }}>
            Email *
          </label>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            style={{ 
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              border: '1.5px solid #e3e9f7',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              transition: 'border 0.2s, box-shadow 0.2s'
            }}
            onFocus={(e) => {
              e.target.style.border = '1.5px solid #36d1c4';
              e.target.style.boxShadow = '0 2px 8px rgba(54,209,196,0.08)';
            }}
            onBlur={(e) => {
              e.target.style.border = '1.5px solid #e3e9f7';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
        
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: '600',
            color: '#222b45'
          }}>
            Question *
          </label>
          <textarea 
            value={question} 
            onChange={e => setQuestion(e.target.value)} 
            required 
            rows={6}
            placeholder="Please describe your question in detail..."
            style={{ 
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              border: '1.5px solid #e3e9f7',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              transition: 'border 0.2s, box-shadow 0.2s',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
            onFocus={(e) => {
              e.target.style.border = '1.5px solid #36d1c4';
              e.target.style.boxShadow = '0 2px 8px rgba(54,209,196,0.08)';
            }}
            onBlur={(e) => {
              e.target.style.border = '1.5px solid #e3e9f7';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%',
            padding: '1rem',
            fontSize: '1.1rem',
            fontWeight: '600',
            backgroundColor: loading ? '#ccc' : 'linear-gradient(135deg, #36d1c4 0%, #5b86e5 100%)',
            background: loading ? '#ccc' : 'linear-gradient(135deg, #36d1c4 0%, #5b86e5 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            boxShadow: loading ? 'none' : '0 4px 15px rgba(91,134,229,0.2)'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(91,134,229,0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(91,134,229,0.2)';
            }
          }}
        >
          {loading ? 'Submitting...' : 'Submit Question'}
        </button>
        
        {success && (
          <div style={{ 
            color: '#155724', 
            backgroundColor: '#d4edda',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #c3e6cb',
            textAlign: 'center',
            fontWeight: '500'
          }}>
            {success}
          </div>
        )}
        
        {error && (
          <div style={{ 
            color: '#721c24', 
            backgroundColor: '#f8d7da',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #f5c6cb',
            textAlign: 'center',
            fontWeight: '500'
          }}>
            {error}
          </div>
        )}
      </form>
      
      <div style={{ 
        textAlign: 'center', 
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <p style={{ 
          color: '#666', 
          fontSize: '0.9rem',
          margin: '0'
        }}>
          💡 <strong>Tip:</strong> Be as specific as possible in your question to help us provide a better answer.
        </p>
      </div>
    </div>
  );
} 