import React, { useEffect, useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  Users,
  BarChart3
} from 'lucide-react';
import { paymentService } from '../../../utils/paymentService';

interface PaymentAnalyticsProps {
  className?: string;
}

export const PaymentAnalytics: React.FC<PaymentAnalyticsProps> = ({ className = '' }) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = () => {
      try {
        const data = paymentService.getPaymentAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to load payment analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
    // Refresh analytics every 30 seconds
    const interval = setInterval(loadAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Unable to load payment analytics</p>
        </div>
      </div>
    );
  }

  const growthColor = analytics.recentTrends.growth >= 0 ? 'text-green-600' : 'text-red-600';
  const GrowthIcon = analytics.recentTrends.growth >= 0 ? TrendingUp : TrendingDown;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Payment Analytics</h3>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-1" />
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Total Revenue</p>
                <p className="text-xl font-bold text-green-900">
                  ${analytics.totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-600">Pending</p>
                <p className="text-xl font-bold text-yellow-900">
                  ${analytics.pendingAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-600">Failed</p>
                <p className="text-xl font-bold text-red-900">
                  ${analytics.failedAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Monthly Performance</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${analytics.recentTrends.thisMonth.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">vs Last Month</p>
                <div className={`flex items-center ${growthColor}`}>
                  <GrowthIcon className="w-4 h-4 mr-1" />
                  <span className="font-semibold">
                    {Math.abs(analytics.recentTrends.growth).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Last month: ${analytics.recentTrends.lastMonth.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Payment Methods</h4>
          <div className="space-y-3">
            {Object.entries(analytics.paymentsByMethod).map(([method, data]: [string, any]) => {
              const percentage = analytics.totalRevenue > 0 
                ? (data.amount / analytics.totalRevenue * 100).toFixed(1)
                : '0';
              
              return (
                <div key={method} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {getMethodLabel(method)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {data.count} transaction{data.count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      ${data.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">{percentage}%</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          {Object.keys(analytics.paymentsByMethod).length === 0 && (
            <div className="text-center py-4 text-gray-500">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No payment data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function getMethodLabel(method: string): string {
  switch (method) {
    case 'credit_card': return 'Credit Card';
    case 'bank_transfer': return 'Bank Transfer';
    case 'cash': return 'Cash';
    case 'check': return 'Check';
    case 'online': return 'Online Payment';
    default: return method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}
