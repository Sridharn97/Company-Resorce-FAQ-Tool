import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';
import FAQCard from '../components/FAQCard';
import UserMenu from '../components/UserMenu';
import FilterDropdown from '../components/FilterDropdown';

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

  // New states
  const [darkMode, setDarkMode] = useState(false);
  const [forceExpanded, setForceExpanded] = useState(undefined);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Dark Mode init
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      setDarkMode(false);
      document.documentElement.removeAttribute('data-theme');
    }
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      setDarkMode(false);
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    } else {
      setDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }
  };

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

  useEffect(() => {
    fetchUser();
    fetchFaqs();
  }, [search, selectedCategory, selectedTag, sortBy, currentPage]);

  // Debounced search suggestions
  useEffect(() => {
    if (search.trim().length > 1) {
      const fetchSuggestions = async () => {
        try {
          const res = await fetch(`/api/faqs?search=${search}&limit=5`);
          if (res.ok) {
            const data = await res.json();
            setSuggestions(data.faqs || []);
          }
        } catch (e) {
          console.error(e);
        }
      };
      const delayDebounceFn = setTimeout(() => {
        fetchSuggestions();
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setSuggestions([]);
    }
  }, [search]);

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

  const toggleExpandAll = () => {
    if (forceExpanded === true) {
      setForceExpanded(false);
    } else {
      setForceExpanded(true);
    }
  };

  const getCategoryIcon = (category) => {
    const cat = category.toLowerCase();
    if (cat.includes('hr') || cat.includes('benefit') || cat.includes('people') || cat.includes('work')) {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>
      );
    } else if (cat.includes('it') || cat.includes('tech') || cat.includes('system') || cat.includes('software') || cat.includes('network') || cat.includes('tool') || cat.includes('access')) {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
      );
    } else if (cat.includes('finance') || cat.includes('pay') || cat.includes('money') || cat.includes('expense') || cat.includes('billing')) {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
          <line x1="1" y1="10" x2="23" y2="10"></line>
        </svg>
      );
    } else {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      );
    }
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
              <Link href="/ask" className={styles.secondaryButton}>Ask a Question</Link>
            )}
            <UserMenu user={user} onLogout={handleLogout} />
            
            <button 
              className={styles.themeToggle} 
              onClick={toggleDarkMode}
              title="Toggle Theme"
              aria-label="Toggle Theme"
            >
              {darkMode ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>
          </nav>
        </header>

        <main className={styles.main}>
          <div className={styles.mainGrid}>
            <aside className={styles.sidebar}>
              {/* Search Wrapper */}
              <div className={styles.searchWrapper}>
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className={styles.searchInput}
                />
                <div className={styles.searchIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>

                {search && (
                  <button
                    type="button"
                    className={styles.clearSearchBtn}
                    onClick={() => {
                      setSearch('');
                      setSuggestions([]);
                    }}
                    title="Clear search"
                    aria-label="Clear search"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}

                {showSuggestions && suggestions.length > 0 && (
                  <div className={styles.suggestionsContainer}>
                    {suggestions.map((faq) => (
                      <button
                        key={faq._id}
                        onMouseDown={() => {
                          setSearch(faq.question);
                          setShowSuggestions(false);
                        }}
                        className={styles.suggestionItem}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.suggestionIcon}>
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <span className={styles.suggestionText}>{faq.question}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Category Cards Quick Filter Grid */}
              <div className={styles.categoryGrid}>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`${styles.categoryCard} ${selectedCategory === 'all' ? styles.activeCategoryCard : ''}`}
                >
                  <div className={styles.categoryCardIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                  </div>
                  <span className={styles.categoryCardName}>All Resources</span>
                </button>
                {categories.filter(cat => cat.toLowerCase() !== 'all').map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`${styles.categoryCard} ${selectedCategory === cat ? styles.activeCategoryCard : ''}`}
                  >
                    <div className={styles.categoryCardIcon}>
                      {getCategoryIcon(cat)}
                    </div>
                    <span className={styles.categoryCardName}>{cat}</span>
                  </button>
                ))}
              </div>

              {/* Filters & Sorting Card */}
              <div className={styles.filterCard}>
                <h4 className={styles.filterCardTitle}>Filters & Sort</h4>
                
                <div className={styles.filterField}>
                  <label>Category</label>
                  <FilterDropdown
                    label="All Categories"
                    options={[{ label: 'All Categories', value: 'all' }, ...(categories || []).filter(cat => cat.toLowerCase() !== 'all').map(cat => ({ label: cat, value: cat }))] }
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                  />
                </div>

                <div className={styles.filterField}>
                  <label>Tags</label>
                  <FilterDropdown
                    label="All Tags"
                    options={[{ label: 'All Tags', value: 'all' }, ...(tags || []).map(tag => ({ label: tag, value: tag }))] }
                    value={selectedTag}
                    onChange={setSelectedTag}
                  />
                </div>

                <div className={styles.filterField}>
                  <label>Sort By</label>
                  <FilterDropdown
                    label="Sort By"
                    options={[
                      { label: 'Newest First', value: 'newest' },
                      { label: 'Most Helpful', value: 'helpful' },
                      { label: 'Most Viewed', value: 'views' }
                    ]}
                    value={sortBy}
                    onChange={setSortBy}
                  />
                </div>

                <button
                  onClick={toggleExpandAll}
                  className={styles.expandAllBtn}
                  title={forceExpanded === true ? "Collapse all FAQs" : "Expand all FAQs"}
                >
                  {forceExpanded === true ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                        <polyline points="4 14 10 14 10 20"></polyline>
                        <polyline points="20 10 14 10 14 4"></polyline>
                        <line x1="14" y1="10" x2="21" y2="3"></line>
                        <line x1="10" y1="14" x2="3" y2="21"></line>
                      </svg>
                      Collapse All
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <polyline points="9 21 3 21 3 15"></polyline>
                        <line x1="21" y1="3" x2="14" y2="10"></line>
                        <line x1="3" y1="21" x2="10" y2="14"></line>
                      </svg>
                      Expand All
                    </>
                  )}
                </button>
              </div>
            </aside>

            {/* Right Content Area */}
            <div className={styles.contentArea}>
              {loading ? (
                <div className={styles.loading}>Loading FAQs...</div>
              ) : (
                <>
                  <div className={styles.faqList}>
                    {Array.isArray(faqs) && faqs.length === 0 ? (
                      <p className={styles.noFaqs}>No FAQs found matching your search criteria.</p>
                    ) : (
                      (faqs || []).map(faq => (
                        <FAQCard key={faq._id} faq={faq} forceExpanded={forceExpanded} />
                      ))
                    )}
                  </div>

                  {renderPagination()}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}