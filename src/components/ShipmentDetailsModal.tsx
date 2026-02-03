import { useQuery } from '@apollo/client';
import { SHIPMENT_QUERY } from '../graphql/operations';

type Props = {
  shipmentId: string;
  onClose: () => void;
};

type ShipmentStatus = 'created' | 'booked' | 'in_transit' | 'delivered' | 'cancelled';

function getStatusBadge(status: ShipmentStatus) {
  const statusConfig: Record<ShipmentStatus, { class: string; label: string }> = {
    created: { class: 'badge-pending', label: 'Created' },
    booked: { class: 'badge-in-transit', label: 'Booked' },
    in_transit: { class: 'badge-in-transit', label: 'In Transit' },
    delivered: { class: 'badge-delivered', label: 'Delivered' },
    cancelled: { class: 'badge-cancelled', label: 'Cancelled' },
  };
  const config = statusConfig[status] ?? { class: 'badge-pending', label: status };
  return <span className={config.class}>{config.label}</span>;
}

export function ShipmentDetailsModal({ shipmentId, onClose }: Props) {
  const { data, loading, error } = useQuery(SHIPMENT_QUERY, {
    variables: { id: shipmentId },
  });

  const shipment = data?.shipment;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card w-full max-w-4xl overflow-hidden"
        style={{ maxHeight: '90vh' }}
      >
        <div className="flex items-center justify-between border-b border-white/10 bg-slate-800/50 px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500">
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Shipment Details</h2>
              <p className="text-xs text-slate-400">ID: {shipmentId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <svg className="h-8 w-8 animate-spin text-sky-500" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-sm text-slate-400">Loading shipment details…</span>
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
              {error.message}
            </div>
          ) : null}

          {shipment ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-xl font-bold text-sky-400">{shipment.referenceNumber}</span>
                {getStatusBadge(shipment.status as ShipmentStatus)}
                {shipment.flagged && <span className="badge-flagged">🚩 Flagged</span>}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-slate-800/30 p-4">
                  <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Shipper
                  </div>
                  <div className="text-lg font-medium text-slate-100">{shipment.shipperName}</div>
                </div>

                <div className="rounded-xl border border-white/10 bg-slate-800/30 p-4">
                  <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="3" width="15" height="13" rx="2" />
                      <path d="M16 8h4l3 3v5a2 2 0 0 1-2 2h-1" />
                      <circle cx="5.5" cy="18.5" r="2.5" />
                      <circle cx="18.5" cy="18.5" r="2.5" />
                    </svg>
                    Carrier
                  </div>
                  <div className="text-lg font-medium text-slate-100">{shipment.carrierName}</div>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-800/30 p-4">
                <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="10" r="3" />
                    <path d="M12 2a8 8 0 0 0-8 8c0 5.4 7 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8Z" />
                  </svg>
                  Route
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="text-xs text-slate-500">Pickup</div>
                    <div className="mt-1 font-medium text-slate-100">{shipment.pickupLocation}</div>
                    <div className="mt-1 text-xs text-slate-400">
                      {new Date(shipment.pickupDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-sky-500/20">
                    <svg className="h-5 w-5 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14m-7-7 7 7-7 7" />
                    </svg>
                  </div>
                  <div className="flex-1 text-right">
                    <div className="text-xs text-slate-500">Delivery</div>
                    <div className="mt-1 font-medium text-slate-100">{shipment.deliveryLocation}</div>
                    <div className="mt-1 text-xs text-slate-400">
                      {shipment.deliveryDate
                        ? new Date(shipment.deliveryDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Pending'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-800/30 p-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                  Rate
                </div>
                <div className="text-2xl font-bold text-emerald-400">
                  {shipment.currency === 'USD' ? '$' : ''}
                  {(shipment.rateCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  <span className="ml-1 text-sm font-normal text-slate-500">{shipment.currency}</span>
                </div>
              </div>

              {shipment.trackingEvents && shipment.trackingEvents.length > 0 ? (
                <div>
                  <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    Tracking History
                  </div>
                  <div className="space-y-3">
                    {shipment.trackingEvents.map(
                      (ev: {
                        id: string;
                        status: string;
                        message: string;
                        location: string;
                        occurredAt: string;
                      }) => (
                        <div
                          key={ev.id}
                          className="flex gap-4 rounded-xl border border-white/10 bg-slate-800/30 p-4"
                        >
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-sky-500/20">
                            <svg className="h-5 w-5 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="10" r="3" />
                              <path d="M12 2a8 8 0 0 0-8 8c0 5.4 7 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8Z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2">
                              {getStatusBadge(ev.status as ShipmentStatus)}
                              <span className="text-xs text-slate-500">
                                {new Date(ev.occurredAt).toLocaleString()}
                              </span>
                            </div>
                            <div className="mt-2 text-sm text-slate-200">{ev.message}</div>
                            <div className="mt-1 text-xs text-slate-400">{ev.location}</div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
