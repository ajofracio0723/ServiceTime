import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

const revenueData = {
  total: 15750,
  monthly: 4200,
  weekly: 950,
  growth: 12.5,
  isPositive: true,
};

export const RevenueWidget = () => {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Total Revenue */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">${revenueData.total.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div className="mt-4 flex items-center">
          {revenueData.isPositive ? (
            <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500 mr-2" />
          )}
          <span className={`text-sm font-medium ${
            revenueData.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {revenueData.growth}% from last month
          </span>
        </div>
      </div>

      {/* Monthly Revenue */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">This Month</p>
            <p className="text-2xl font-bold text-gray-900">${revenueData.monthly.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '68%' }}></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">68% of monthly goal</p>
        </div>
      </div>

      {/* Weekly Revenue */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">This Week</p>
            <p className="text-2xl font-bold text-gray-900">${revenueData.weekly.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-orange-600" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-600">4 jobs completed</p>
          <p className="text-xs text-gray-500">Average: $237.50 per job</p>
        </div>
      </div>
    </div>
  );
};