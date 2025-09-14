import { useEffect, useState } from "react";
import { authFetch } from "../../../utils/AuthFetch";
import { toast } from "react-toastify";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const API_URL = "https://localhost:7000/api";

function DashboardCharts() {
    const [ordersOverTime, setOrdersOverTime] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [revenueByCategory, setRevenueByCategory] = useState([]);

    useEffect(() => {
        fetchOrdersOverTime();
        fetchTopProducts();
        fetchRevenueByCategory();
    }, []);

    const fetchOrdersOverTime = async () => {
        try {
            const res = await authFetch(`${API_URL}/dashboard/orders-over-time`);

            if(!res.ok) {
                toast.error('Failed to fetch orders over time');
                return;
            }

            const data = await res.json();
            setOrdersOverTime(data);
        } catch (error) {
            console.error(error);
            toast.error('An error occurred while fetching orders over time');
        }
    };

    const fetchTopProducts = async () => {
        try {
            const res = await authFetch(`${API_URL}/dashboard/top-products`);

            if(!res.ok) {
                toast.error('Failed to fetch top products');
                return;
            }

            const data = await res.json();
            setTopProducts(data);
        } catch (error) {
            console.error(error);
            toast.error('An error occurred while fetching top products');
        }
    };

    const fetchRevenueByCategory = async () => {
        try {
            const res = await authFetch(`${API_URL}/dashboard/revenue-by-category`);

            if(!res.ok) {
                toast.error('Failed to fetch revenue by category');
                return;
            }

            const data = await res.json();
            setRevenueByCategory(data);
        } catch (error) {
            console.error(error);
            toast.error('An error occurred while fetching revenue by category');
        }
    };

    const pieColors = ['#007bff', '#28a745', '#ffc107', '#17a2b8', '#dc3545'];

    return (
        <div className="mt-5">
            <div className="row mb-4">
                <div className="col-lg-12">
                    <h5>📈 Orders Over Time (Last 30 Days)</h5>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={ordersOverTime}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis type="number" domain={[0, 'dataMax']} allowDecimals={false} tickCount={8} />
                            <Tooltip />
                            <Line type="monotone" dataKey="count" stroke="#007bff" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="row mb-4">
                <div className="col-lg-6">
                    <h5>🏆 Top Selling Products</h5>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart layout="vertical" data={topProducts} margin={{ left: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[0, 'dataMax']} allowDecimals={false} tickCount={6} />
                            <YAxis dataKey="product" type="category" interval={0} width={150} />
                            <Tooltip />
                            <Bar dataKey="quantity" fill="#28a745" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="col-lg-6">
                <h5>💰 Revenue by Category</h5>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie dataKey="revenue" nameKey="category" data={revenueByCategory} cx="50%" cy="50%" outerRadius={100} label>
                            {revenueByCategory.map((entry, index) => (
                                <Cell key={index} fill={pieColors[index % pieColors.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default DashboardCharts;