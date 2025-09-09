import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { JobsOverview } from "./job/JobsOverview";
import { RevenueWidget } from "./RevenueWidget";
import { QuickActions } from "./QuickActions";
import Client from './client/Client';
import { Property } from "./property/Property";
import { Estimate } from "./estimate/Estimate";
import { Job } from "./job/Job";
import { VisitWithViewMode } from "./visit/VisitWithViewMode";
import { Invoice } from "./Invoice";
import { Payment } from "./Payment";
import { Files } from "./Files";
import { Settings } from "./Settings";
import { Notification } from "./Notification";
import { useOnboarding } from "../../context/OnboardingContext";
import {
  Calendar,
  Users,
  CheckCircle,
  Clock,
  Bell,
  Search,
} from "lucide-react";

export const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const { state } = useOnboarding();
  const { businessInfo, personalInfo } = state.data;

  const stats = [
    {
      label: "Today's Jobs",
      value: "8",
      icon: Calendar,
      color: "text-blue-600 bg-blue-100",
      trend: "+2 from yesterday",
    },
    {
      label: "Active Clients",
      value: "156",
      icon: Users,
      color: "text-green-600 bg-green-100",
      trend: "+12 this month",
    },
    {
      label: "Completed Jobs",
      value: "24",
      icon: CheckCircle,
      color: "text-purple-600 bg-purple-100",
      trend: "This week",
    },
    {
      label: "Pending Jobs",
      value: "6",
      icon: Clock,
      color: "text-orange-600 bg-orange-100",
      trend: "Need attention",
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          {stat.label}
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stat.value}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {stat.trend}
                        </p>
                      </div>
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Revenue Widget */}
            <RevenueWidget />

            {/* Jobs Overview */}
            <JobsOverview />

            {/* Quick Actions */}
            <QuickActions />
          </div>
        );

      case "clients":
        return <Client />;

      case "properties":
        return <Property />;

      case "jobs":
        return <Job />;

      case "visits":
      case "visits-calendar":
      case "visits-list":
      case "visits-routes":
      case "visits-gps":
        return <VisitWithViewMode activeSection={activeSection} />;

      case "estimates":
        return <Estimate />;

      case "invoices":
        return <Invoice />;

      case "payments":
        return <Payment />;

      case "files":
        return <Files />;

      case "notifications":
        return <Notification />;

      case "settings-account":
        return <Settings section={activeSection} />;

      case "settings-users":
        return <Settings section={activeSection} />;

      case "settings-pricebook":
        return <Settings section={activeSection} />;

      case "settings-communication":
        return <Settings section={activeSection} />;

      default:
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-500 text-xl font-bold">
                {activeSection.charAt(0).toUpperCase()}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
            </h2>
            <p className="text-gray-600">This section is coming soon.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {personalInfo.name.split(" ")[0]}!
              </h1>
              <p className="text-gray-600">
                Here's what's happening with {businessInfo.businessName} today
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search jobs, clients..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="relative p-2 text-gray-400 hover:text-gray-600">
                <Bell className="w-6 h-6" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">{renderContent()}</main>
      </div>
    </div>
  );
};
