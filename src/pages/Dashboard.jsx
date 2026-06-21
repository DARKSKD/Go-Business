import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { fetchReferrals } from '../api/client';
import { formatDate, formatProfit } from '../utils/format';

const PAGE_SIZE = 10;

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState([]);
  const [serviceSummary, setServiceSummary] = useState(null);
  const [referral, setReferral] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('desc');
  const [page, setPage] = useState(1);
  const [copiedField, setCopiedField] = useState('');
  const navigate = useNavigate();

  const loadData = useCallback(async (params) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchReferrals(params);
      setMetrics(data?.metrics || []);
      setServiceSummary(data?.serviceSummary || null);
      setReferral(data?.referral || null);
      setReferrals(data?.referrals || []);
      setPage(1);
    } catch (err) {
      setError(err.message || 'Something went wrong while loading referrals.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData({ sort });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData({ search: search || undefined, sort });
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sort]);

  function handleCopy(text, field) {
    navigator.clipboard?.writeText(text || '');
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 1500);
  }

  const totalPages = Math.max(1, Math.ceil(referrals.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageRows = referrals.slice(startIndex, startIndex + PAGE_SIZE);
  const from = referrals.length === 0 ? 0 : startIndex + 1;
  const to = Math.min(startIndex + PAGE_SIZE, referrals.length);

  return (
    <div className="page">
      <Navbar />
      <main className="dashboard">
        <header className="page-header">
          <div>
            <h1>Referral Dashboard</h1>
            <p className="subtitle">Track your referrals, earnings, and partner activity in one place.</p>
          </div>
        </header>

        {loading && <p className="loading-text">Loading dashboard data…</p>}
        {error && (
          <p className="error-text" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && (
          <>
            <section className="card" role="region" aria-label="Overview metrics">
              <h2>Overview</h2>
              <div className="metrics-grid">
                {metrics.map((m, i) => (
                  <div className="metric" key={m.id || m.label}>
                    <span className="metric-icon">{['$', '#', '%', '~'][i % 4]}</span>
                    <span className="metric-value">{m.value}</span>
                    <span className="metric-label">{m.label}</span>
                  </div>
                ))}
              </div>
            </section>

            {serviceSummary && (
              <section className="card" aria-label="Service summary">
                <h2>Service summary</h2>
                <div className="summary-grid">
                  <div>
                    <span className="summary-label">Service</span>
                    <span className="summary-value link">{serviceSummary.service}</span>
                  </div>
                  <div>
                    <span className="summary-label">Your Referrals</span>
                    <span className="summary-value">{serviceSummary.yourReferrals}</span>
                  </div>
                  <div>
                    <span className="summary-label">Active Referrals</span>
                    <span className="summary-value">{serviceSummary.activeReferrals}</span>
                  </div>
                  <div>
                    <span className="summary-label">Total Ref. Earnings</span>
                    <span className="summary-value">{serviceSummary.totalRefEarnings}</span>
                  </div>
                </div>
              </section>
            )}

            {referral && (
              <section className="card" aria-label="Share referral">
                <h2>Refer friends and earn more</h2>
                <div className="share-grid">
                  <div className="share-row">
                    <label htmlFor="referral-link">Your Referral Link</label>
                    <div className="share-input">
                      <input id="referral-link" readOnly value={referral.link || ''} />
                      <button type="button" className="btn btn-secondary" onClick={() => handleCopy(referral.link, 'link')}>
                        Copy
                      </button>
                    </div>
                    {copiedField === 'link' && <span className="copied-hint">Copied</span>}
                  </div>
                  <div className="share-row">
                    <label htmlFor="referral-code">Your Referral Code</label>
                    <div className="share-input">
                      <input id="referral-code" readOnly value={referral.code || ''} />
                      <button type="button" className="btn btn-secondary" onClick={() => handleCopy(referral.code, 'code')}>
                        Copy
                      </button>
                    </div>
                    {copiedField === 'code' && <span className="copied-hint">Copied</span>}
                  </div>
                </div>
              </section>
            )}

            <section className="card">
              <div className="table-toolbar">
                <h2>All referrals</h2>
                <div className="toolbar-controls">
                  <div className="control-group">
                    <span className="control-label">Search</span>
                    <input
                      type="search"
                      placeholder="Name or service…"
                      aria-label="Search referrals"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <label className="control-group">
                    <span className="control-label">Sort by date</span>
                    <select value={sort} onChange={(e) => setSort(e.target.value)}>
                      <option value="desc">Newest first</option>
                      <option value="asc">Oldest first</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Service</th>
                      <th>Date</th>
                      <th>Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.length === 0 && (
                      <tr>
                        <td colSpan={4} className="empty-cell">
                          No matching entries
                        </td>
                      </tr>
                    )}
                    {pageRows.map((row) => (
                      <tr
                        key={row.id}
                        tabIndex={0}
                        className="clickable-row"
                        onClick={() => navigate(`/referral/${row.id}`)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') navigate(`/referral/${row.id}`);
                        }}
                      >
                        <td>{row.name}</td>
                        <td>{row.serviceName}</td>
                        <td>{formatDate(row.date)}</td>
                        <td className="profit-cell">{formatProfit(row.profit)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pagination">
                <span className="pagination-summary">
                  {referrals.length === 0
                    ? 'Showing 0–0 of 0 entries'
                    : `Showing ${from}–${to} of ${referrals.length} entries`}
                </span>
                <div className="pagination-controls">
                  <button
                    type="button"
                    className="btn btn-table-nav"
                    disabled={currentPage === 1}
                    onClick={() => setPage(currentPage - 1)}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      type="button"
                      className={`btn btn-page ${num === currentPage ? 'active' : ''}`}
                      onClick={() => setPage(num)}
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="btn btn-table-nav"
                    disabled={currentPage === totalPages}
                    onClick={() => setPage(currentPage + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
