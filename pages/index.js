import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [faqs, setFaqs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [user, setUser] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFaqs, setTotalFaqs] = useState(0);
  const [faqsPerPage] = useState(6);

  useEffect(() => {
    fetchUser();
    fetchFaqs();
  }, [search, selectedCategory, selectedTag, sortBy, currentPage]);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const userData = await res.json();
        setUser(userData.user);
      }
    } catch (error) {
      // User not logged in
    }
  };

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedTag !== 'all') params.append('tags', selectedTag);
      if (sortBy) params.append('sort', sortBy);
      params.append('page', currentPage);
      params.append('limit', faqsPerPage);

      const res = await fetch(`/api/faqs?${params}`);
      if (!res.ok) {
        setFaqs([]);
        setCategories([]);
        setTags([]);
        setTotalPages(1);
        setTotalFaqs(0);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setFaqs(Array.isArray(data.faqs) ? data.faqs : []);
      setCategories(Array.isArray(data.categories) ? data.categories : []);
      setTags(Array.isArray(data.tags) ? data.tags : []);
      setTotalPages(data.totalPages || 1);
      setTotalFaqs(data.totalFaqs || 0);
    } catch (error) {
      setFaqs([]);
      setCategories([]);
      setTags([]);
      setTotalPages(1);
      setTotalFaqs(0);
      console.error('Failed to fetch FAQs:', error);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      window.location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
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

  return (
    <>
      <Head>
        <title>Company Resource FAQ</title>
        <meta name="description" content="Company Resource FAQ Tool" />
      </Head>

      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Company Resource FAQ</h1>
          <nav className={styles.nav}>
            {(!user || user.role !== 'admin') && (
              <Link href="/ask" className={styles.askButton}>Ask a Question</Link>
            )}
            {user ? (
              <>
                <span>Welcome, {user.email}</span>
                {/* <Link href="/profile"></Link> */}
                {user.role === 'admin' && (
                  <Link href="/admin/dashboard">Admin Dashboard</Link>
                )}
                <button onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link href="/login">Login</Link>
                <Link href="/signup">Sign Up</Link>
              </>
            )}
          </nav>
        </header>

        <main className={styles.main}>
          <div className={styles.searchSection}>
            <input
              type="text"
              placeholder="Search FAQs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
            
            <div className={styles.filters}>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Categories</option>
                {(categories || []).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Tags</option>
                {(tags || []).map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="newest">Newest</option>
                <option value="helpful">Most Helpful</option>
                <option value="views">Most Viewed</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className={styles.loading}>Loading FAQs...</div>
          ) : (
            <>
              <div className={styles.resultsInfo}>
                <p>Showing {faqs.length} of {totalFaqs} FAQs</p>
              </div>
              
              <div className={styles.faqList}>
                {Array.isArray(faqs) && faqs.length === 0 ? (
                  <p>No FAQs found matching your search criteria.</p>
                ) : (
                  (faqs || []).map(faq => (
                    <Link key={faq._id} href={`/faq/${faq._id}`} className={styles.faqCardLink}>
                      <div className={styles.faqCard} tabIndex={0} role="button" aria-label={`View FAQ: ${faq.question}`}>
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
                        <div className={styles.faqCardFooter}>
                          <span className={styles.faqCardButton}>View FAQ →</span>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>

              {renderPagination()}
            </>
          )}
        </main>
      </div>
    </>
  );
}