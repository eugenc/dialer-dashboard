import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { Search, Download, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { campaignApi } from '../lib/api';
import type { CallLog } from '../lib/types';

type SortField = 'timestamp' | 'phone' | 'status' | 'duration';
type SortDirection = 'asc' | 'desc';

const statusColors: Record<string, string> = {
  connected: 'bg-green-100 text-green-800',
  voicemail: 'bg-cyan-100 text-cyan-800',
  'no-answer': 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800',
  dialing: 'bg-blue-100 text-blue-800',
  completed: 'bg-gray-100 text-gray-800',
};

export default function CallHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['call-history'],
    queryFn: () => campaignApi.getLogs(1000).then(res => res.data),
    refetchInterval: 5000,
  });

  // Process and filter data
  const processedData = useMemo(() => {
    if (!data?.logs) return [];

    let result = data.logs as CallLog[];

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(call =>
        call.phone.toLowerCase().includes(search) ||
        call.answeredBy?.toLowerCase().includes(search)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(call => call.status === statusFilter);
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      let aVal: any, bVal: any;

      switch (sortField) {
        case 'timestamp':
          aVal = new Date(a.timestamp).getTime();
          bVal = new Date(b.timestamp).getTime();
          break;
        case 'phone':
          aVal = a.phone;
          bVal = b.phone;
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        case 'duration':
          aVal = a.duration || 0;
          bVal = b.duration || 0;
          break;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [data, searchTerm, statusFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="inline ml-1 w-4 h-4" /> : <ChevronDown className="inline ml-1 w-4 h-4" />;
  };

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds === 0) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const exportToCSV = () => {
    const headers = ['Timestamp', 'Phone', 'Status', 'Duration', 'Answered By', 'Error'];
    const rows = processedData.map(call => [
      format(parseISO(call.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      call.phone,
      call.status,
      formatDuration(call.duration),
      call.answeredBy || '-',
      call.error || '-'
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `call-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    const json = JSON.stringify(processedData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `call-history-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getUniqueStatuses = () => {
    if (!data?.logs) return [];
    const statuses = new Set(data.logs.map((call: CallLog) => call.status));
    return Array.from(statuses).sort();
  };

  if (isLoading) {
    return (
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Call History</h2>
        <p className="text-gray-600 mb-6">View and analyze all past calls</p>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading call history...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Call History</h2>
        <p className="text-gray-600 mb-6">View and analyze all past calls</p>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading call history. Please try again.</p>
        </div>
      </div>
    );
  }

  const stats = {
    total: processedData.length,
    connected: processedData.filter(c => c.status === 'connected').length,
    voicemail: processedData.filter(c => c.status === 'voicemail').length,
    failed: processedData.filter(c => c.status === 'failed').length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Call History</h2>
          <p className="text-gray-600">View and analyze all past calls</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={exportToJSON}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Total Calls</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <div className="text-sm text-green-700 mb-1">Connected</div>
          <div className="text-2xl font-bold text-green-900">{stats.connected}</div>
        </div>
        <div className="bg-cyan-50 rounded-lg border border-cyan-200 p-4">
          <div className="text-sm text-cyan-700 mb-1">Voicemail</div>
          <div className="text-2xl font-bold text-cyan-900">{stats.voicemail}</div>
        </div>
        <div className="bg-red-50 rounded-lg border border-red-200 p-4">
          <div className="text-sm text-red-700 mb-1">Failed</div>
          <div className="text-2xl font-bold text-red-900">{stats.failed}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
          >
            <Filter className="w-4 h-4" />
            Filters
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by phone or answered by..."
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                {getUniqueStatuses().map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  onClick={() => handleSort('timestamp')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Time
                  {getSortIcon('timestamp')}
                </th>
                <th
                  onClick={() => handleSort('phone')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Phone
                  {getSortIcon('phone')}
                </th>
                <th
                  onClick={() => handleSort('status')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Status
                  {getSortIcon('status')}
                </th>
                <th
                  onClick={() => handleSort('duration')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Duration
                  {getSortIcon('duration')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {processedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No calls found
                  </td>
                </tr>
              ) : (
                processedData.map((call) => (
                  <tr key={call.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(parseISO(call.timestamp), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {call.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[call.status] || 'bg-gray-100 text-gray-800'}`}>
                        {call.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDuration(call.duration)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {call.retellCallId ? (
                        <span className="text-green-600">✓ Retell</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination info */}
      <div className="mt-4 text-sm text-gray-600 text-center">
        Showing {processedData.length} of {data?.logs?.length || 0} calls
      </div>
    </div>
  );
}
