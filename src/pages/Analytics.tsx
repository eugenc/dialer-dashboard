import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { campaignApi } from '../lib/api';
import type { CallLog } from '../lib/types';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899'];

export default function Analytics() {
  const { data: stats } = useQuery({
    queryKey: ['campaign-stats'],
    queryFn: () => campaignApi.getStats().then(res => res.data),
    refetchInterval: 5000,
  });

  const { data: callsData } = useQuery({
    queryKey: ['call-history'],
    queryFn: () => campaignApi.getLogs(1000).then(res => res.data),
  });

  // Calculate hourly call volume
  const hourlyData = useMemo(() => {
    if (!callsData?.logs) return [];
    
    const calls = callsData.logs as CallLog[];
    const hourlyMap = new Map<number, { connected: number; total: number }>();
    
    calls.forEach(call => {
      const hour = new Date(call.timestamp).getHours();
      const existing = hourlyMap.get(hour) || { connected: 0, total: 0 };
      
      existing.total++;
      if (call.status === 'connected') {
        existing.connected++;
      }
      
      hourlyMap.set(hour, existing);
    });
    
    const result = [];
    for (let i = 0; i < 24; i++) {
      const data = hourlyMap.get(i) || { connected: 0, total: 0 };
      result.push({
        hour: i,
        label: `${i}:00`,
        connected: data.connected,
        total: data.total
      });
    }
    
    return result;
  }, [callsData]);

  // Calculate status distribution
  const statusDistribution = useMemo(() => {
    if (!callsData?.logs) return [];
    
    const calls = callsData.logs as CallLog[];
    const statusMap = new Map<string, number>();
    
    calls.forEach(call => {
      const current = statusMap.get(call.status) || 0;
      statusMap.set(call.status, current + 1);
    });
    
    return Array.from(statusMap.entries()).map(([name, value]) => ({ name, value }));
  }, [callsData]);

  // Calculate recent trends (last 7 days)
  const trendData = useMemo(() => {
    if (!callsData?.logs) return [];
    
    const calls = callsData.logs as CallLog[];
    const dayMap = new Map<string, { connected: number; total: number }>();
    
    calls.forEach(call => {
      const date = new Date(call.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const existing = dayMap.get(date) || { connected: 0, total: 0 };
      
      existing.total++;
      if (call.status === 'connected') {
        existing.connected++;
      }
      
      dayMap.set(date, existing);
    });
    
    return Array.from(dayMap.entries())
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([date, data]) => ({ date, ...data }));
  }, [callsData]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    if (!stats || !callsData?.logs) return null;
    
    const calls = callsData.logs as CallLog[];
    const total = calls.length;
    const connected = calls.filter(c => c.status === 'connected').length;
    const voicemail = calls.filter(c => c.status === 'voicemail').length;
    const avgDuration = calls
      .filter(c => c.status === 'connected' && c.duration > 0)
      .reduce((sum, c) => sum + c.duration, 0) / connected;
    
    return {
      connectionRate: total > 0 ? ((connected / total) * 100).toFixed(1) : '0',
      voicemailRate: total > 0 ? ((voicemail / total) * 100).toFixed(1) : '0',
      avgDuration: isNaN(avgDuration) ? '0' : avgDuration.toFixed(0),
      totalCalls: total
    };
  }, [stats, callsData]);

  if (!stats || !callsData) {
    return (
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Insights</h2>
        <p className="text-gray-600 mb-6">Performance metrics and trends</p>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Insights</h2>
        <p className="text-gray-600 mb-6">Performance metrics and trends</p>
      </div>

      {/* KPI Cards */}
      {kpis && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Connection Rate</div>
            <div className="text-3xl font-bold text-green-600">{kpis.connectionRate}%</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Voicemail Rate</div>
            <div className="text-3xl font-bold text-cyan-600">{kpis.voicemailRate}%</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Avg Duration</div>
            <div className="text-3xl font-bold text-blue-600">{kpis.avgDuration}s</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Total Calls</div>
            <div className="text-3xl font-bold text-gray-900">{kpis.totalCalls}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => `${props.name} ${props.percent ? (props.percent * 100).toFixed(0) : 0}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Trends */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Connection Rate Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="connected" stroke="#10b981" name="Connected" />
              <Line type="monotone" dataKey="total" stroke="#6366f1" name="Total" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hourly Performance */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Calls by Hour of Day</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="connected" fill="#10b981" name="Connected" />
            <Bar dataKey="total" fill="#6366f1" name="Total" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Summary Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metric
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Human Detection Rate
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {stats.calls?.humanDetectionRate || 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Percentage of calls where human was detected
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Retell Success Rate
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {stats.calls?.retellSuccessRate || 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Percentage of human calls connected to Retell AI
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Avg Time to Agent
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {stats.calls?.avgTimeToAgent ? `${stats.calls.avgTimeToAgent}s` : 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Average time from call answered to AI agent connection
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Active Calls
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {stats.calls?.activeCalls || 0}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Currently active calls
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
