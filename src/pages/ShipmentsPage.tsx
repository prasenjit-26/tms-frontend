import { useMutation, useQuery } from '@apollo/client';
import { useMemo, useState } from 'react';
import {
  DELETE_SHIPMENT_MUTATION,
  FLAG_SHIPMENT_MUTATION,
  SHIPMENTS_QUERY,
} from '../graphql/operations';
import { useAuth } from '../lib/useAuth';
import { ShipmentDetailsModal } from '../components/ShipmentDetailsModal';

type ShipmentStatus = 'created' | 'booked' | 'in_transit' | 'delivered' | 'cancelled';

type ShipmentListItem = {
  id: string;
  referenceNumber: string;
  shipperName: string;
  carrierName: string;
  pickupLocation: string;
  deliveryLocation: string;
  pickupDate: string;
  deliveryDate: string | null;
  status: ShipmentStatus;
  rateCents: number;
  currency: string;
  flagged: boolean;
  updatedAt: string;
};

type ShipmentsData = {
  shipments: {
    nodes: ShipmentListItem[];
    totalCount: number;
    page: number;
    pageSize: number;
    hasNextPage: boolean;
  };
};

type ViewMode = 'table' | 'grid';

type SortField = 'pickupDate' | 'updatedAt' | 'shipperName' | 'carrierName' | 'status';

type SortDirection = 'asc' | 'desc';

export function ShipmentsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<ShipmentStatus | ''>('');
  const [flagged, setFlagged] = useState<'all' | 'flagged' | 'not_flagged'>('all');

  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);

  const filter = useMemo(() => {
    const filterObject: Record<string, unknown> = {};
    if (query.trim().length > 0) filterObject.q = query.trim();
    if (status) filterObject.status = status;
    if (flagged !== 'all') filterObject.flagged = flagged === 'flagged';
    return filterObject
  }, [flagged, query, status]);
  const sort = useMemo(() => {
    return {
      field: sortField,
      direction: sortDirection,
    };
  }, [sortDirection, sortField]);

  const { data, loading, error, refetch } = useQuery<ShipmentsData>(SHIPMENTS_QUERY, {
    variables: {
      pagination: { page, pageSize },
      filter,
      sort,
    },
    fetchPolicy: 'cache-and-network',
  });

  const [flagShipment, flagState] = useMutation(FLAG_SHIPMENT_MUTATION);
  const [deleteShipment, deleteState] = useMutation(DELETE_SHIPMENT_MUTATION);

  async function onToggleFlag(id: string, next: boolean) {
    await flagShipment({ variables: { id, flagged: next } });
    await refetch();
  }

  async function onDelete(id: string) {
    const ok = window.confirm('Delete this shipment?');
    if (!ok) return;

    await deleteShipment({ variables: { id } });
    await refetch();
  }

  const shipments = data?.shipments.nodes ?? [];
  const totalCount = data?.shipments.totalCount ?? 0;
  const hasNextPage = data?.shipments.hasNextPage ?? false;

  function getStatusBadge(s: ShipmentStatus) {
    const statusConfig: Record<ShipmentStatus, { class: string; label: string }> = {
      created: { class: 'badge-pending', label: 'Created' },
      booked: { class: 'badge-in-transit', label: 'Booked' },
      in_transit: { class: 'badge-in-transit', label: 'In Transit' },
      delivered: { class: 'badge-delivered', label: 'Delivered' },
      cancelled: { class: 'badge-cancelled', label: 'Cancelled' },
    };
    const config = statusConfig[s];
    return <span className={config.class}>{config.label}</span>;
  }

  return (
    <div className="px-4 py-8 mx-auto max-w-7xl">
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shipments</h1>
          <p className="mt-1 text-sm text-slate-400">
            {totalCount} shipments · Page {page}
          </p>
        </div>

        <div className="flex gap-2 items-center">
          <div className="flex overflow-hidden rounded-xl border border-white/10">
            <button
              onClick={() => setViewMode('table')}
              className={`rounded-none border-0 px-3 py-2 ${
                viewMode === 'table'
                  ? 'bg-white/10 text-white'
                  : 'bg-transparent text-slate-400 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-none border-0 px-3 py-2 ${
                viewMode === 'grid'
                  ? 'bg-white/10 text-white'
                  : 'bg-transparent text-slate-400 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </button>
          </div>
          <button
            onClick={() => refetch()}
            disabled={loading}
            className="flex gap-2 items-center"
          >
            <svg
              className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <div className="p-4 mb-6 card">
        <div className="grid gap-4 md:grid-cols-5">
          <label className="block">
            <div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">
              Search
            </div>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search shipments…"
                className="pl-10"
              />
            </div>
          </label>

          <label className="block">
            <div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">
              Status
            </div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as ShipmentStatus | '');
                setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="created">Created</option>
              <option value="booked">Booked</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          

          <label className="block">
            <div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">
              Flag Status
            </div>
            <select
              value={flagged}
              onChange={(e) => {
                setFlagged(e.target.value as typeof flagged);
                setPage(1);
              }}
            >
              <option value="all">All</option>
              <option value="flagged">🚩 Flagged</option>
              <option value="not_flagged">Not Flagged</option>
            </select>
          </label>

          <label className="block">
            <div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">
              Sort By
            </div>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
            >
              <option value="updatedAt">Last Updated</option>
              <option value="pickupDate">Pickup Date</option>
              <option value="shipperName">Shipper</option>
              <option value="carrierName">Carrier</option>
              <option value="status">Status</option>
            </select>
          </label>

          <label className="block">
            <div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">
              Order
            </div>
            <select
              value={sortDirection}
              onChange={(e) => setSortDirection(e.target.value as SortDirection)}
            >
              <option value="desc">↓ Descending</option>
              <option value="asc">↑ Ascending</option>
            </select>
          </label>
        </div>
      </div>

      <div>
        {error ? (
          <div className="p-4 mb-4 text-sm text-rose-300 card border-rose-500/30 bg-rose-500/10">
            {error.message}
          </div>
        ) : null}

        {loading && shipments.length === 0 ? (
          <div className="flex justify-center items-center p-12 card">
            <div className="flex flex-col gap-3 items-center">
              <svg className="w-8 h-8 text-sky-500 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span className="text-sm text-slate-400">Loading shipments…</span>
            </div>
          </div>
        ) : null}

        {!loading && shipments.length === 0 ? (
          <div className="flex flex-col justify-center items-center p-12 text-center card">
            <div className="flex justify-center items-center mb-4 w-16 h-16 rounded-full bg-slate-800">
              <svg className="w-8 h-8 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium">No shipments found</h3>
            <p className="mt-1 text-sm text-slate-400">Try adjusting your filters</p>
          </div>
        ) : null}

        {viewMode === 'table' && shipments.length > 0 ? (
          <div className="overflow-hidden card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-slate-800/50">
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-400">Reference</th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-400">Shipper</th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-400">Carrier</th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-400">Status</th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-400">Route</th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-400">Flag</th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-right uppercase text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {shipments.map((s: ShipmentListItem) => (
                    <tr key={s.id} className="transition-colors hover:bg-white/5">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm font-medium text-sky-400">{s.referenceNumber}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-slate-200">{s.shipperName}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-slate-300">{s.carrierName}</div>
                      </td>
                      <td className="px-4 py-4">{getStatusBadge(s.status)}</td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2 items-center text-sm text-slate-400">
                          <span>{s.pickupLocation}</span>
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14m-7-7 7 7-7 7" />
                          </svg>
                          <span>{s.deliveryLocation}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {s.flagged ? (
                          <span className="badge-flagged">🚩 Flagged</span>
                        ) : (
                          <span className="text-sm text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setSelectedShipmentId(s.id)}
                            className="btn-primary px-3 py-1.5 text-xs"
                          >
                            View
                          </button>
                          {isAdmin ? (
                            <>
                              <button
                                disabled={flagState.loading}
                                onClick={() => onToggleFlag(s.id, !s.flagged)}
                                className="px-3 py-1.5 text-xs"
                              >
                                {s.flagged ? 'Unflag' : 'Flag'}
                              </button>
                              <button
                                disabled={deleteState.loading}
                                onClick={() => onDelete(s.id)}
                                className="btn-danger px-3 py-1.5 text-xs"
                              >
                                Delete
                              </button>
                            </>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {viewMode === 'grid' && shipments.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {shipments.map((s: ShipmentListItem) => (
              <div key={s.id} className="p-5 card-hover">
                <div className="flex gap-3 justify-between items-start">
                  <div>
                    <span className="font-mono text-sm font-medium text-sky-400">{s.referenceNumber}</span>
                    {s.flagged && <span className="ml-2">🚩</span>}
                  </div>
                  {getStatusBadge(s.status)}
                </div>

                <div className="mt-4">
                  <div className="text-sm font-medium text-slate-200">{s.shipperName}</div>
                  <div className="mt-0.5 text-xs text-slate-500">{s.carrierName}</div>
                </div>

                <div className="flex gap-2 items-center mt-4 text-xs text-slate-400">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="10" r="3" />
                    <path d="M12 2a8 8 0 0 0-8 8c0 5.4 7 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8Z" />
                  </svg>
                  <span>{s.pickupLocation}</span>
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14m-7-7 7 7-7 7" />
                  </svg>
                  <span>{s.deliveryLocation}</span>
                </div>

                <div className="flex flex-wrap gap-2 pt-4 mt-4 border-t border-white/10">
                  <button
                    onClick={() => setSelectedShipmentId(s.id)}
                    className="btn-primary flex-1 px-3 py-1.5 text-xs"
                  >
                    View Details
                  </button>
                  {isAdmin ? (
                    <>
                      <button
                        disabled={flagState.loading}
                        onClick={() => onToggleFlag(s.id, !s.flagged)}
                        className="px-3 py-1.5 text-xs"
                      >
                        {s.flagged ? 'Unflag' : 'Flag'}
                      </button>
                      <button
                        disabled={deleteState.loading}
                        onClick={() => onDelete(s.id)}
                        className="btn-danger px-3 py-1.5 text-xs"
                      >
                        Delete
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {shipments.length > 0 ? (
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex gap-2 items-center"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Previous
            </button>

            <div className="flex gap-1 items-center">
              {Array.from({ length: Math.min(5, Math.ceil(totalCount / pageSize)) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`h-8 w-8 rounded-lg text-sm ${
                    p === page
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                      : 'bg-transparent text-slate-400'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNextPage}
              className="flex gap-2 items-center"
            >
              Next
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        ) : null}

        {!isAdmin ? (
          <div className="p-4 mt-6 text-sm text-amber-300 rounded-xl border border-amber-500/20 bg-amber-500/5">
            <span className="mr-2">ℹ️</span>
            Employee role: view-only access. Contact an admin to flag or delete shipments.
          </div>
        ) : null}
      </div>

      {selectedShipmentId ? (
        <ShipmentDetailsModal shipmentId={selectedShipmentId} onClose={() => setSelectedShipmentId(null)} />
      ) : null}
    </div>
  );
}
