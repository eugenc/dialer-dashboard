export interface CampaignStats {
  active: boolean;
  total: number;
  pending: number;
  dialing: number;
  answered: number;
  voicemail: number;
  noAnswer: number;
  failed: number;
  connected: number;
}

export interface CallLog {
  id: string;
  timestamp: string;
  phone: string;
  status: string;
  duration: number;
  callSid: string;
  retellCallId: string | null;
  answeredBy: string | null;
  error: string | null;
  metadata: Record<string, any>;
}

export interface Lead {
  id?: string;
  phone: string;
  name: string;
  status: string;
  callSid: string | null;
  retellCallId: string | null;
  retryCount: number;
  lastAttempt: string | null;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface MonitorResponse {
  success: boolean;
  campaign: CampaignStats;
  calls: {
    totalCalls: number;
    activeCalls: number;
    connectedCalls: number;
    avgTimeToAgent: number | null;
    humanDetectionRate: string;
    retellSuccessRate: string;
  };
  timestamp: string;
}

