// Mock financial data service - no backend needed
const DEMO_TRANSACTIONS = [
    { id: '1', type: 'INFLOW', amount: 50000, category: 'Sales Revenue', date: '2024-01-15', description: 'Product sales' },
    { id: '2', type: 'INFLOW', amount: 25000, category: 'Consulting', date: '2024-01-20', description: 'Consulting services' },
    { id: '3', type: 'OUTFLOW', amount: 15000, category: 'Rent', date: '2024-01-05', description: 'Office rent' },
    { id: '4', type: 'OUTFLOW', amount: 8000, category: 'Salaries', date: '2024-01-10', description: 'Employee salaries' },
    { id: '5', type: 'OUTFLOW', amount: 3000, category: 'GST', date: '2024-01-12', description: 'GST payment' },
    { id: '6', type: 'OUTFLOW', amount: 5000, category: 'Software', date: '2024-01-18', description: 'Software subscriptions' },
    { id: '7', type: 'INFLOW', amount: 30000, category: 'Sales Revenue', date: '2024-02-01', description: 'February sales' },
    { id: '8', type: 'OUTFLOW', amount: 2000, category: 'Marketing', date: '2024-02-05', description: 'Ad spend' },
];

class MockDataService {
    constructor() {
        this.STORAGE_KEY = 'cashflow_records';
        this.initializeData();
    }

    initializeData() {
        const userId = this.getCurrentUserId();
        if (!userId) return;

        const key = `${this.STORAGE_KEY}_${userId}`;
        const existing = localStorage.getItem(key);

        if (!existing) {
            // First time - populate demo data
            localStorage.setItem(key, JSON.stringify(DEMO_TRANSACTIONS));
        }
    }

    getCurrentUserId() {
        const user = localStorage.getItem('cashflow_current_user');
        return user ? JSON.parse(user).id : null;
    }

    getRecords() {
        const userId = this.getCurrentUserId();
        if (!userId) return [];

        const key = `${this.STORAGE_KEY}_${userId}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }

    addRecord(record) {
        const userId = this.getCurrentUserId();
        if (!userId) throw new Error('No user logged in');

        const records = this.getRecords();
        const newRecord = {
            ...record,
            id: Date.now().toString(),
            date: record.date || new Date().toISOString().split('T')[0],
        };

        records.push(newRecord);
        const key = `${this.STORAGE_KEY}_${userId}`;
        localStorage.setItem(key, JSON.stringify(records));

        return newRecord;
    }

    deleteRecord(id) {
        const userId = this.getCurrentUserId();
        if (!userId) throw new Error('No user logged in');

        const records = this.getRecords();
        const filtered = records.filter(r => r.id !== id);

        const key = `${this.STORAGE_KEY}_${userId}`;
        localStorage.setItem(key, JSON.stringify(filtered));
    }

    getFinancialSummary() {
        const records = this.getRecords();

        const totalInflow = records
            .filter(r => r.type === 'INFLOW')
            .reduce((sum, r) => sum + r.amount, 0);

        const totalOutflow = records
            .filter(r => r.type === 'OUTFLOW')
            .reduce((sum, r) => sum + r.amount, 0);

        const balance = totalInflow - totalOutflow;

        // Calculate monthly averages
        const now = new Date();
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

        const recentRecords = records.filter(r => new Date(r.date) >= oneMonthAgo);

        const monthlyInflow = recentRecords
            .filter(r => r.type === 'INFLOW')
            .reduce((sum, r) => sum + r.amount, 0);

        const monthlyOutflow = recentRecords
            .filter(r => r.type === 'OUTFLOW')
            .reduce((sum, r) => sum + r.amount, 0);

        return {
            balance,
            totalInflow,
            totalOutflow,
            monthlyInflow,
            monthlyOutflow,
            burnRate: monthlyOutflow,
            runwayDays: monthlyOutflow > 0 ? Math.round((balance / monthlyOutflow) * 30) : 999,
        };
    }
}

export default new MockDataService();
