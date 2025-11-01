import { useQuery } from '@tanstack/react-query';
import { campaignApi } from '../lib/api';

export default function CallHistory() {
  const { data, isLoading } = useQuery({
    queryKey: ['call-history'],
    queryFn: () => campaignApi.getLogs(100).then(res => res.data),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Call History</h2>
      <p className="text-gray-600 mb-6">View and analyze all past calls</p>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-gray-500">
          Coming soon: Full call history with filters, search, and export
        </div>
      </div>
    </div>
  );
}

