import type { CampaignStats as CampaignStatsType } from '../../lib/types';
import StatCard from './StatCard';

interface Props {
  stats: CampaignStatsType;
}

export default function CampaignStatsComponent({ stats }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        label="Active Campaign"
        value={stats.active ? 'Running' : 'Stopped'}
        color={stats.active ? 'success' : 'gray'}
      />
      <StatCard
        label="Total Leads"
        value={stats.total}
        color="primary"
      />
      <StatCard
        label="Connected"
        value={stats.connected}
        color="success"
      />
      <StatCard
        label="Failed"
        value={stats.failed}
        color="danger"
      />
      <StatCard
        label="Dialing"
        value={stats.dialing}
        color="warning"
      />
      <StatCard
        label="Voicemail"
        value={stats.voicemail}
        color="info"
      />
      <StatCard
        label="No Answer"
        value={stats.noAnswer}
        color="warning"
      />
      <StatCard
        label="Pending"
        value={stats.pending}
        color="gray"
      />
    </div>
  );
}

