import { useQuery } from '@tanstack/react-query';
import { campaignApi } from '../../lib/api';
import { CallLog } from '../../lib/types';

const statusColors: Record<string, string> = {
  connected: 'text-green-600',
  dialing: 'text-yellow-600',
  failed: 'text-red-600',
  voicemail: 'text-cyan-600',
  'no-answer': 'text-yellow-600',
  completed: 'text-gray-600',
};

export default function LiveTimeline() {
  const { data, isLoading } = useQuery({
    queryKey: ['recent-calls'],
    queryFn: () => campaignApi.getLogs(20).then(res => res.data),
    refetchInterval: 5000,
  });

  if (isLoading) {
    return <div className="text-gray-500">Loading timeline...</div>;
  }

  const calls = (data?.logs || []) as CallLog[];
  const recentCalls = calls.slice(0, 10);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {recentCalls.length === 0 ? (
          <div className="text-gray-500 text-center py-8">No recent calls</div>
        ) : (
          recentCalls.map((call) => (
            <div key={call.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className={`font-medium ${statusColors[call.status] || 'text-gray-900'}`}>
                    {call.phone}
                  </span>
                  <span className={`text-sm px-2 py-1 rounded ${statusColors[call.status] || 'bg-gray-100'}`}>
                    {call.status}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(call.timestamp).toLocaleString()}
                  {call.duration > 0 && ` • ${call.duration}s`}
                </div>
              </div>
              {call.retellCallId && (
                <span className="text-xs text-green-600">✓ Retell</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

