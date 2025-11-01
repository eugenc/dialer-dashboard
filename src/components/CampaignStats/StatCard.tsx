interface StatCardProps {
  label: string;
  value: string | number;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'gray';
}

const colorClasses = {
  primary: 'border-blue-500 bg-blue-50',
  success: 'border-green-500 bg-green-50',
  warning: 'border-yellow-500 bg-yellow-50',
  danger: 'border-red-500 bg-red-50',
  info: 'border-cyan-500 bg-cyan-50',
  gray: 'border-gray-300 bg-gray-50',
};

export default function StatCard({ label, value, color = 'primary' }: StatCardProps) {
  const borderClass = colorClasses[color];
  
  return (
    <div className={`rounded-lg border-2 ${borderClass} p-6`}>
      <div className="text-sm font-medium text-gray-600 mb-2">{label}</div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

