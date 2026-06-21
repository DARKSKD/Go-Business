import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { fetchReferrals } from '../api/client';
import { formatDate, formatProfit } from '../utils/format';

export default function ReferralDetail() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchReferrals({ id })
      .then((data) => {
        if (!active) return;
        let found = null;
        if (Array.isArray(data?.referrals)) {
          found = data.referrals.find((r) => String(r.id) === String(id)) || null;
        }
        if (!found && data && data.id !== undefined) {
          found = String(data.id) === String(id) ? data : null;
        }
        setRow(found);
      })
      .catch(() => setRow(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <div className="page">
      <Navbar />
      <main className="detail-page">
        <Link to="/" className="back-link">
          ← Back to dashboard
        </Link>

        {loading && <p className="loading-text">Loading referral…</p>}

        {!loading && row && (
          <>
            <h1>Referral Details</h1>
            <p className="subtitle">Full information for this referral partner.</p>
            <section className="card">
              <div className="detail-card-header">
                <h2>{row.name}</h2>
                <span className="badge">{row.serviceName}</span>
              </div>
              <dl className="detail-list">
                <div>
                  <dt>Referral ID</dt>
                  <dd>{row.id}</dd>
                </div>
                <div>
                  <dt>Name</dt>
                  <dd>{row.name}</dd>
                </div>
                <div>
                  <dt>Service Name</dt>
                  <dd>{row.serviceName}</dd>
                </div>
                <div>
                  <dt>Date</dt>
                  <dd>{formatDate(row.date)}</dd>
                </div>
                <div>
                  <dt>Profit</dt>
                  <dd>{formatProfit(row.profit)}</dd>
                </div>
              </dl>
            </section>
          </>
        )}

        {!loading && !row && (
          <section className="not-found-section">
            <h1>Referral not found</h1>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
