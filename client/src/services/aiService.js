// Rule-based AI CFO chatbot - no backend API needed
import mockData from './mockData';

class AIService {
    generateResponse(userMessage) {
        const summary = mockData.getFinancialSummary();
        const { balance, monthlyInflow, monthlyOutflow, burnRate, runwayDays } = summary;

        // Determine risk level
        let riskLevel = 'Low';
        let riskColor = '🟢';
        let advice = '';

        if (balance < 0) {
            riskLevel = 'High';
            riskColor = '🔴';
            advice = 'Immediate action required: You are cash negative. Delay non-essential payments and follow up on outstanding invoices to recover positive cash flow.';
        } else if (runwayDays < 30) {
            riskLevel = 'Medium';
            riskColor = '🟡';
            advice = 'Caution advised: Your cash runway is tight. Consider delaying non-essential spending and following up on pending payments to extend your runway.';
        } else if (runwayDays < 60) {
            riskLevel = 'Medium';
            riskColor = '🟡';
            advice = 'Stable but monitor closely: You have a reasonable buffer, but watch your expense trends. Consider building a 3-month reserve.';
        } else {
            riskLevel = 'Low';
            riskColor = '🟢';
            advice = 'Strong financial position: You have a healthy cash balance. Consider reinvesting surplus cash into growth opportunities or building an emergency fund.';
        }

        // Context-aware responses based on user question
        const lowerMessage = userMessage.toLowerCase();

        if (lowerMessage.includes('balance') || lowerMessage.includes('cash')) {
            return this.formatResponse(
                `Your current cash balance is $${balance.toLocaleString()}.`,
                riskLevel,
                riskColor,
                monthlyInflow,
                monthlyOutflow,
                advice
            );
        }

        if (lowerMessage.includes('runway') || lowerMessage.includes('survive') || lowerMessage.includes('last')) {
            return this.formatResponse(
                `Based on your monthly burn rate of $${burnRate.toLocaleString()}, you have approximately ${runwayDays} days of runway.`,
                riskLevel,
                riskColor,
                monthlyInflow,
                monthlyOutflow,
                advice
            );
        }

        if (lowerMessage.includes('hire') || lowerMessage.includes('employee') || lowerMessage.includes('salary')) {
            const canHire = balance > 50000 && runwayDays > 90;
            const recommendation = canHire
                ? 'Yes, your financial position supports hiring. Ensure the new hire contributes to revenue growth.'
                : 'I recommend waiting until your cash position improves. Focus on revenue growth first.';

            return this.formatResponse(
                recommendation,
                riskLevel,
                riskColor,
                monthlyInflow,
                monthlyOutflow,
                advice
            );
        }

        if (lowerMessage.includes('spend') || lowerMessage.includes('buy') || lowerMessage.includes('purchase')) {
            const canSpend = balance > 30000 && runwayDays > 60;
            const recommendation = canSpend
                ? 'You have room for strategic purchases. Prioritize expenses that generate ROI.'
                : 'I recommend delaying non-essential purchases until your cash buffer improves.';

            return this.formatResponse(
                recommendation,
                riskLevel,
                riskColor,
                monthlyInflow,
                monthlyOutflow,
                advice
            );
        }

        // Default comprehensive analysis
        return this.formatResponse(
            `I've analyzed your financial position.`,
            riskLevel,
            riskColor,
            monthlyInflow,
            monthlyOutflow,
            advice
        );
    }

    formatResponse(opening, riskLevel, riskColor, monthlyInflow, monthlyOutflow, advice) {
        return `${opening}

${riskColor} **Risk Assessment (30 Days):** ${riskLevel}

**Financial Summary:**
• Monthly Revenue: $${monthlyInflow.toLocaleString()}
• Monthly Expenses: $${monthlyOutflow.toLocaleString()}
• Net Position: ${monthlyInflow > monthlyOutflow ? '+' : ''}$${(monthlyInflow - monthlyOutflow).toLocaleString()}

**Recommendation:**
${advice}`;
    }

    saveChat(message, response) {
        const userId = mockData.getCurrentUserId();
        if (!userId) return;

        const chats = this.getChatHistory();
        chats.push({
            id: Date.now().toString(),
            message,
            response,
            timestamp: new Date().toISOString(),
        });

        localStorage.setItem(`cashflow_chats_${userId}`, JSON.stringify(chats));
    }

    getChatHistory() {
        const userId = mockData.getCurrentUserId();
        if (!userId) return [];

        const data = localStorage.getItem(`cashflow_chats_${userId}`);
        return data ? JSON.parse(data) : [];
    }
}

export default new AIService();
