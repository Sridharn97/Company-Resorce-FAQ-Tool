import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../../styles/Admin.module.css';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const router = useRouter();

  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFaqs, setTotalFaqs] = useState(0);
  const [faqsPerPage] = useState(10);

  useEffect(() => {
    const initializeData = async () => {
      await checkAuth();
      await fetchFaqs();
      await fetchAnalytics();
    };
    initializeData();
  }, [currentPage]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };


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
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchFaqs = async () => {
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('limit', faqsPerPage);

      const res = await fetch(`/api/faqs?${params}`);
      const data = await res.json();
      setFaqs(Array.isArray(data.faqs) ? data.faqs : []);
      setTotalPages(data.totalPages || 1);
      setTotalFaqs(data.totalFaqs || 0);
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
      setFaqs([]);
      setTotalPages(1);
      setTotalFaqs(0);
    }
    setLoading(false);
  };

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
        // Refresh the page data to update totals
        fetchFaqs();
      } else {
        alert('Failed to delete FAQ');
      }
    } catch (error) {
      alert('Failed to delete FAQ');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className={styles.pagination}>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={styles.pageButton}
        >
          Previous
        </button>
        
        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className={styles.pageButton}
            >
              1
            </button>
            {startPage > 2 && <span className={styles.pageEllipsis}>...</span>}
          </>
        )}

        {pages.map(page => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`${styles.pageButton} ${currentPage === page ? styles.activePage : ''}`}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className={styles.pageEllipsis}>...</span>}
            <button
              onClick={() => handlePageChange(totalPages)}
              className={styles.pageButton}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={styles.pageButton}
        >
          Next
        </button>
      </div>
    );
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
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Total FAQs</p>
                <h3 className={styles.statValue}>{analytics?.stats?.totalFaqs || 0}</h3>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Total Views</p>
                <h3 className={styles.statValue}>{analytics?.stats?.totalViews || 0}</h3>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Pending Questions</p>
                <h3 className={styles.statValue}>{analytics?.stats?.pendingQuestions || 0}</h3>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Helpful Votes</p>
                <h3 className={styles.statValue}>{analytics?.stats?.totalHelpful || 0}</h3>
              </div>
            </div>
          </div>


          <section className={styles.insightsSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.gradientText}>Impact Analytics & Knowledge Gaps</span>
              </h2>
              <p className={styles.sectionSubtitle}>Data-driven insights to improve your resource coverage</p>
            </div>

            <div className={styles.insightsGrid}>
              <div className={styles.knowledgeGapsCard}>
                <div className={styles.cardHeader}>
                  <h4>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', color: 'var(--error)', verticalAlign: 'middle' }}>
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    High-Priority Gaps
                  </h4>
                  <p>Categories with high demand but few FAQs</p>
                </div>
                <div className={styles.gapsList}>
                  {analytics?.knowledgeGaps?.length > 0 ? (
                    analytics.knowledgeGaps.map((gap, i) => (
                      <div key={i} className={`${styles.gapItem} ${styles[gap.priority.toLowerCase()]}`}>
                        <div className={styles.gapInfo}>
                          <p className={styles.gapCategory}>{gap.category}</p>
                          <p className={styles.gapReason}>{gap.reason}</p>
                        </div>
                        <div className={styles.gapBadge}>
                          {gap.pendingQuestions ? `${gap.pendingQuestions} Pending Qs` : `${gap.currentFaqs} FAQ(s)`}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.emptyGaps}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      All categories are well-covered!
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.categoryPerformanceCard}>
                <div className={styles.cardHeader}>
                  <h4>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', color: 'var(--primary)', verticalAlign: 'middle' }}>
                      <line x1="18" y1="20" x2="18" y2="10"></line>
                      <line x1="12" y1="20" x2="12" y2="4"></line>
                      <line x1="6" y1="20" x2="6" y2="14"></line>
                    </svg>
                    Top Category Efficiency
                  </h4>
                  <p>Average views per FAQ</p>
                </div>
                <div className={styles.performanceList}>
                  {(analytics?.categoryData || []).slice(0, 5).map((d, i) => (
                    <div key={i} className={styles.performanceItem}>
                      <span className={styles.perfLabel}>{d.category}</span>
                      <div className={styles.perfBarWrapper}>
                        <div 
                          className={styles.perfBar} 
                          style={{ width: `${Math.min(100, (d.efficiencyScore / Math.max(...analytics.categoryData.map(cd => cd.efficiencyScore))) * 100)}%` }}
                        ></div>
                      </div>
                      <span className={styles.perfValue}>{d.efficiencyScore} v/f</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>


          <div className={styles.faqList}>
            <h2>Manage FAQs</h2>
            {faqs.length === 0 ? (
              <p>No FAQs found. <Link href="/admin/create-faq">Create your first FAQ</Link></p>
            ) : (
              <>
                <div className={styles.resultsInfo}>
                  <p>Showing {faqs.length} of {totalFaqs} FAQs (Page {currentPage} of {totalPages})</p>
                </div>
                <div className={styles.faqTable}>
                  {faqs.map(faq => (
                    <div key={faq._id} className={styles.faqRow}>
                      <div className={styles.faqInfo}>
                        <h3>{faq.question}</h3>
                        <div className={styles.faqMeta}>
                          <span>{faq.category}</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--success)' }}><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                              {faq.helpfulYes}
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--error)' }}><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm12-7h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path></svg>
                              {faq.helpfulNo}
                            </span>
                          </span>
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
                {renderPagination()}
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}