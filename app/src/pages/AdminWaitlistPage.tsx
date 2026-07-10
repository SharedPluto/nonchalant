import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Trash2, Users, Mail } from 'lucide-react';
import { useWaitlistStore } from '@/stores/waitlistStore';

export default function AdminWaitlistPage() {
  const { entries } = useWaitlistStore();
  const [confirmClear, setConfirmClear] = useState(false);

  // Group by product
  const byProduct = entries.reduce(
    (acc, entry) => {
      if (!acc[entry.productHandle]) {
        acc[entry.productHandle] = {
          name: entry.productName,
          image: entry.productImage,
          emails: [],
        };
      }
      acc[entry.productHandle].emails.push({
        email: entry.email,
        size: entry.size,
        date: entry.createdAt,
      });
      return acc;
    },
    {} as Record<
      string,
      { name: string; image: string; emails: { email: string; size?: string; date: string }[] }
    >
  );

  // Export as CSV
  const handleExport = () => {
    const csv = [
      ['Product', 'Email', 'Size', 'Date'].join(','),
      ...entries.map((e) =>
        [
          `"${e.productName}"`,
          e.email,
          e.size || '',
          new Date(e.createdAt).toLocaleDateString(),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nonchalant-waitlist-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Clear all
  const handleClear = () => {
    useWaitlistStore.setState({ entries: [] });
    setConfirmClear(false);
  };

  return (
    <main className="min-h-screen bg-[var(--nc-bg)] pt-[80px] pb-20">
      <div className="max-w-[1000px] mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              to="/shop"
              className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-[var(--nc-grey)] hover:text-[var(--nc-purple)] transition-colors mb-3"
            >
              <ArrowLeft size={14} />
              Back to Shop
            </Link>
            <h1 className="text-xl font-medium uppercase tracking-[0.02em]">
              Waitlist
            </h1>
            <p className="text-[13px] text-[var(--nc-grey)] mt-1">
              Manage restock notification requests
            </p>
          </div>

          <div className="flex items-center gap-3">
            {entries.length > 0 && (
              <>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[var(--nc-purple)] text-white text-[11px] uppercase tracking-wider font-medium hover:opacity-90 transition-opacity"
                >
                  <Download size={14} />
                  Export CSV
                </button>
                <button
                  onClick={() => setConfirmClear(true)}
                  className="flex items-center gap-2 px-4 py-2.5 border border-[var(--nc-red)] text-[var(--nc-red)] text-[11px] uppercase tracking-wider font-medium hover:bg-[var(--nc-red)] hover:text-white transition-colors"
                >
                  <Trash2 size={14} />
                  Clear All
                </button>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[var(--nc-offwhite)] p-5">
            <div className="flex items-center gap-3 mb-2">
              <Users size={18} className="text-[var(--nc-purple)]" />
              <span className="text-[11px] uppercase tracking-wider text-[var(--nc-grey)]">
                Total Subscribers
              </span>
            </div>
            <p className="text-2xl font-medium">{entries.length}</p>
          </div>
          <div className="bg-[var(--nc-offwhite)] p-5">
            <div className="flex items-center gap-3 mb-2">
              <Mail size={18} className="text-[var(--nc-purple)]" />
              <span className="text-[11px] uppercase tracking-wider text-[var(--nc-grey)]">
                Unique Products
              </span>
            </div>
            <p className="text-2xl font-medium">{Object.keys(byProduct).length}</p>
          </div>
        </div>

        {/* Entries by product */}
        {entries.length === 0 ? (
          <div className="text-center py-20">
            <Mail size={32} className="text-[var(--nc-grey)]/30 mx-auto mb-4" />
            <p className="text-[var(--nc-grey)]">No waitlist entries yet.</p>
            <p className="text-[13px] text-[var(--nc-grey)] mt-1">
              When customers click "Notify Me" on sold-out items, they'll appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(byProduct).map(([handle, data]) => (
              <div
                key={handle}
                className="border border-[var(--nc-border)] overflow-hidden"
              >
                {/* Product header */}
                <div className="flex items-center gap-4 p-4 bg-[var(--nc-offwhite)] border-b border-[var(--nc-border)]">
                  <img
                    src={data.image}
                    alt={data.name}
                    className="w-12 h-12 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate">{data.name}</p>
                    <p className="text-[11px] text-[var(--nc-grey)]">
                      {data.emails.length} subscriber{data.emails.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Link
                    to={`/product/${handle}`}
                    className="text-[10px] uppercase tracking-wider text-[var(--nc-purple)] hover:underline flex-shrink-0"
                  >
                    View Product
                  </Link>
                </div>

                {/* Email list */}
                <div className="divide-y divide-[var(--nc-border)]">
                  {data.emails.map((e, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-4 py-3 hover:bg-[var(--nc-offwhite)]/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Mail size={13} className="text-[var(--nc-grey)] flex-shrink-0" />
                        <span className="text-[13px] truncate">{e.email}</span>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                        {e.size && (
                          <span className="text-[10px] uppercase tracking-wider text-[var(--nc-grey)] bg-[var(--nc-offwhite)] px-2 py-0.5">
                            {e.size}
                          </span>
                        )}
                        <span className="text-[11px] text-[var(--nc-grey)]">
                          {new Date(e.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Confirm clear modal */}
        {confirmClear && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setConfirmClear(false)}
            />
            <div className="relative bg-[var(--nc-bg)] w-full max-w-[400px] p-6 shadow-xl">
              <h3 className="text-sm font-medium uppercase tracking-wider mb-2">
                Clear All Entries?
              </h3>
              <p className="text-[13px] text-[var(--nc-grey)] mb-6">
                This will permanently delete all {entries.length} waitlist entries. This
                action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmClear(false)}
                  className="flex-1 py-3 text-[11px] uppercase tracking-wider border border-[var(--nc-border)] hover:border-[var(--nc-text)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClear}
                  className="flex-1 py-3 text-[11px] uppercase tracking-wider bg-[var(--nc-red)] text-white hover:opacity-90 transition-opacity"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
