import DashboardCharts from "./DashboardCharts";
import DashboardSummaryCards from "./DashboardSummaryCards";
import LowStockWarning from "./LowStockWarning";

function Dashboard() {
    return (
        <div className="container-fluid">
            <h3 className="h3 mb-4 text-gray-800">Dashborad</h3>
            <DashboardSummaryCards />
            <LowStockWarning />
            <DashboardCharts />
        </div>
    );
}

export default Dashboard;