import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { motion } from 'framer-motion';

const data = [
    { name: 'Jan', inflow: 4000, outflow: 2400 },
    { name: 'Feb', inflow: 3000, outflow: 1398 },
    { name: 'Mar', inflow: 2000, outflow: 9800 },
    { name: 'Apr', inflow: 2780, outflow: 3908 },
    { name: 'May', inflow: 1890, outflow: 4800 },
    { name: 'Jun', inflow: 2390, outflow: 3800 },
    { name: 'Jul', inflow: 3490, outflow: 4300 },
];

const expenseData = [
    { name: 'Rent', value: 2500 },
    { name: 'Salaries', value: 4000 },
    { name: 'Utilities', value: 800 },
    { name: 'Inventory', value: 1200 },
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#F43F5E'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-sm border border-slate-700">
                <p className="font-semibold mb-2">{label}</p>
                {payload.map((p, index) => (
                    <p key={index} style={{ color: p.color }}>
                        {p.name === 'inflow' ? 'Inflow' : 'Outflow'}: ${p.value.toLocaleString()}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export const TrendChart = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-96"
        >
            <h3 className="text-lg font-bold text-slate-900 mb-6">Cash Flow Trend</h3>
            <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(value) => `$${value / 1000}k`} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="inflow"
                        stroke="#2563EB"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorInflow)"
                        name="Inflow"
                    />
                    <Area
                        type="monotone"
                        dataKey="outflow"
                        stroke="#F43F5E"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorOutflow)"
                        name="Outflow"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </motion.div>
    );
};

export const ExpenseChart = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-96"
        >
            <h3 className="text-lg font-bold text-slate-900 mb-6">Expense Breakdown</h3>
            <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                    <Pie
                        data={expenseData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {expenseData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
            </ResponsiveContainer>
        </motion.div>
    );
};

export const HealthIndicator = ({ balance }) => {
    let status = "Healthy";
    let color = "bg-emerald-500";
    let txtColor = "text-emerald-700";
    let bgColor = "bg-emerald-50";

    if (balance < 1000) {
        status = "Critical Risk";
        color = "bg-rose-500";
        txtColor = "text-rose-700";
        bgColor = "bg-rose-50";
    } else if (balance < 3000) {
        status = "Warning";
        color = "bg-amber-500";
        txtColor = "text-amber-700";
        bgColor = "bg-amber-50";
    }

    return (
        <div className={`flex items-center gap-3 px-4 py-2 rounded-full ${bgColor} border border-transparent`}>
            <span className={`relative flex h-3 w-3`}>
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${color}`}></span>
            </span>
            <span className={`text-sm font-bold ${txtColor}`}>{status}</span>
        </div>
    );
};
