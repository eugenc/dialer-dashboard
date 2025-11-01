import { useQuery } from '@tanstack/react-query';
import { campaignApi } from '../lib/api';
import CampaignStatsComponent from '../components/CampaignStats/CampaignStats';
import LiveTimeline from '../components/CampaignStats/LiveTimeline';

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['campaign-stats'],
    queryFn: () => campaignApi.getStats().then(res => res.data),
    refetchInterval: 5000, // Poll every 5 seconds
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Campaign Overview</h2>
        <p className="text-gray-600">Real-time monitoring of your dialing campaigns</p>
      </div>

      {stats && (
        <>
          <CampaignStatsComponent stats={stats.campaign} />
          <LiveTimeline />
        </>
      )}
    </div>
  );
}

