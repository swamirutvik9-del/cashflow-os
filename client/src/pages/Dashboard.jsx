import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import mockData from '../services/mockData';
import { TrendingUp, TrendingDown, Wallet, Plus, Minus, ArrowUpRight, ArrowDownRight, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { TrendChart, ExpenseChart, HealthIndicator } from '../components/DashboardCharts';

const StatCard = ({ title, amount, type, subtitle }) => {
    const isPositive = type === 'inflow' || type === 'balance';
    const Icon = type === 'balance' ? Wallet : (type === 'inflow' ? TrendingUp : TrendingDown);

    const iconBg = type === 'balance'
        ? 'bg-blue-50 text-blue-600'
        : (type === 'inflow' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600');

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${iconBg}`}>
                    <Icon size={22} />
                </div>
                <span className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    {isPositive ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownRight size={12} className="mr-1" />}
                    {Math.floor(Math.random() * 10) + 2}%
                </span>
            </div>
            <div>
                <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
                {subtitle && <p className="text-xs text-slate-400 mt-2">{subtitle}</p>}
            </div>
        </motion.div>
    );
};

const Dashboard = () => {
    const { user } = useAuth();
    const [financials, setFinancials] = useState({
        balance: 0,
        inflow: 0,
        outflow: 0,
        transactions: []
    });
    const [loading, setLoading] = useState(true);

    const fetchFinancials = () => {
        try {
            const summary = mockData.getFinancialSummary();
            const records = mockData.getRecords();

            setFinancials({
                balance: summary.balance,
                inflow: summary.monthlyInflow,
                outflow: summary.monthlyOutflow,
                transactions: records.sort((a, b) => new Date(b.date) - new Date(a.date))
            });
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFinancials();
    }, []);

    const addTransaction = (type) => {
        const amount = prompt(`Enter ${type} amount:`);
        if (!amount) return;

        try {
            mockData.addRecord({
                type: type === 'Income' ? 'INFLOW' : 'OUTFLOW',
                amount: parseFloat(amount),
                category: 'Uncategorized',
                description: `Manual ${type} entry`
            });
            fetchFinancials();
        } catch (error) {
            alert('Failed to add transaction');
        }
    };

    if (loading) return (
        <Layout>
            <div className="flex h-[80vh] items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 bg-slate-200 rounded-full mb-4"></div>
                    <div className="h-4 w-32 bg-slate-200 rounded"></div>
                </div>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="space-y-8">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-4 mb-1">
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Financial Overview</h1>
                            <HealthIndicator balance={financials.balance} />
                        </div>
                        <p className="text-slate-500 mt-1">Real-time insights for {user?.name}'s business</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => addTransaction('Income')}
                            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-all shadow-lg shadow-slate-900/20 active:scale-95"
                        >
                            <Plus size={18} />
                            <span>Add Income</span>
                        </button>
                        <button
                            onClick={() => addTransaction('Expense')}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-medium transition-all active:scale-95"
                        >
                            <Minus size={18} />
                            <span>Add Expense</span>
                        </button>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        title="Total Balance"
                        amount={financials.balance}
                        type="balance"
                        subtitle="Available cash on hand"
                    />
                    <StatCard
                        title="Monthly Inflow"
                        amount={financials.inflow}
                        type="inflow"
                        subtitle="+12% from last month"
                    />
                    <StatCard
                        title="Monthly Outflow"
                        amount={financials.outflow}
                        type="outflow"
                        subtitle="Controlled expenses"
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <TrendChart />
                    <ExpenseChart />
                </div>

                {/* Transactions Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Transactions List */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-slate-900">Recent Transactions</h2>
                            <button className="text-sm text-primary font-medium hover:text-primary-dark">View All</button>
                        </div>
                        {financials.transactions.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CreditCard className="text-slate-300" size={32} />
                                </div>
                                <p className="text-slate-500">No transactions found. Start by adding one.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {financials.transactions.map((t) => (
                                    <div key={t.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'INFLOW' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                                }`}>
                                                {t.type === 'INFLOW' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 group-hover:text-primary transition-colors">{t.description || t.category}</p>
                                                <p className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {t.category}</p>
                                            </div>
                                        </div>
                                        <span className={`font-bold tabular-nums ${t.type === 'INFLOW' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                            {t.type === 'INFLOW' ? '+' : '-'}${t.amount.toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Actions / Obligation Placeholder */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Upcoming Obligations</h2>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-slate-700">Office Rent</span>
                                    <span className="text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-700 rounded">Pending</span>
                                </div>
                                <p className="text-2xl font-bold text-slate-900">$2,500.00</p>
                                <p className="text-xs text-slate-400 mt-1">Due in 5 days</p>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 opacity-60">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-slate-700">Server Costs</span>
                                    <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded">Paid</span>
                                </div>
                                <p className="text-2xl font-bold text-slate-900">$120.00</p>
                                <p className="text-xs text-slate-400 mt-1">Paid on Jan 1st</p>
                            </div>
                        </div>
                        <button className="w-full mt-6 py-3 rounded-lg border border-dashed border-slate-300 text-slate-500 hover:border-primary hover:text-primary transition-all text-sm font-medium">
                            + Add Obligation
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
