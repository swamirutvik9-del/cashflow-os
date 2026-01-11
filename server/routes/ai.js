const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { readDB, writeDB } = require('../db');
const auth = require('../middleware/auth');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();

// Initialize Gemini
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

router.post('/chat', auth, async (req, res) => {
    try {
        const { message } = req.body;
        const db = readDB();
        const userRecords = db.records.filter(r => r.userId === req.user.id);
        const userName = req.user.name || "Business Owner";

        // 1. Analyze Financials
        const totalInflow = userRecords
            .filter(r => r.type === 'INFLOW')
            .reduce((sum, r) => sum + r.amount, 0);

        const totalOutflow = userRecords
            .filter(r => r.type === 'OUTFLOW')
            .reduce((sum, r) => sum + r.amount, 0);

        const balance = totalInflow - totalOutflow;

        // Get last 5 transactions for context
        const recentTx = userRecords
            .slice(-5)
            .map(r => `${r.type}: $${r.amount} (${r.category})`)
            .join(", ");

        let aiResponse = "";

        // 2. Try Gemini API
        if (genAI) {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-pro" });
                const prompt = `
          Act as a highly intelligent, strategic Virtual CFO for a small business. 
          Your goal is to provide actionable, data-driven financial advice.
          
          User Name: ${userName}
          
          Financial Context:
          - Current Cash Balance: $${balance}
          - Total Inflow (Revenue): $${totalInflow}
          - Total Outflow (Expenses): $${totalOutflow}
          - Recent Transactions: ${recentTx}

          User Question: "${message}"

          Guidelines:
          1. **Analyze First**: Look at the balance vs. expenses. Is the user safe or in danger?
          2. **Be Specific**: Cite specific numbers from the context to back up your advice.
          3. **Strategic Tone**: Speak like a senior financial advisor. Be encouraging but direct about risks.
          4. **Structure**: Use bullet points if listing steps. Keep the response under 150 words but make it high-value.
          5. **No Fluff**: Do not say "As an AI". Jump straight to the insights.
        `;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                aiResponse = response.text();
            } catch (apiError) {
                console.error("Gemini API Failed, falling back to mock:", apiError.message);
            }
        }


        // 3. Fallback Mock Logic (If Gemini disabled or failed)
        if (!aiResponse) {
            let riskMessage = "Your cash position looks stable.";
            let riskLevel = "Low"; // Initialize riskLevel for mock logic
            const burnRate = totalOutflow || 1;
            const runwayDays = (balance / burnRate) * 30;

            if (balance < 0) {
                riskLevel = "Critical";
                riskMessage = "CRITICAL: You are cash negative. Immediate funds needed.";
            } else if (runwayDays < 15) {
                riskLevel = "High";
                riskMessage = "Urgent: You have less than 15 days of cash coverage.";
            } else if (runwayDays < 30) {
                riskLevel = "Medium";
                riskMessage = "Caution: Your cash buffer is tight for the coming month.";
            }

            aiResponse = `[Mock AI] Based on your balance of $${balance}, your risk is ${riskLevel}. ${riskMessage}. Recommendation: Review your recent ${totalOutflow} in expenses to find savings.`;
        }

        const newChat = {
            id: uuidv4(),
            userId: req.user.id,
            message: message,
            response: aiResponse,
            timestamp: new Date().toISOString()
        };

        if (!db.chats) db.chats = [];
        db.chats.push(newChat);
        writeDB(db);

        // Simulate thinking delay only if mock (real API takes time)
        if (!genAI) {
            setTimeout(() => {
                res.json({ message: aiResponse, history: newChat });
            }, 800);
        } else {
            res.json({ message: aiResponse, history: newChat });
        }

    } catch (error) {
        console.error("AI Route Error:", error);
        // Silent fail safe
        res.json({
            message: "I am having trouble accessing your financial data right now, but generally, valid cash flow management requires keeping expenses lower than income. Please try again later.",
            history: { id: uuidv4(), role: 'ai', text: "Service temporary unavailable." }
        });
    }
});

router.get('/history', auth, (req, res) => {
    try {
        const db = readDB();
        const history = db.chats ? db.chats.filter(c => c.userId === req.user.id) : [];
        res.json(history);
    } catch (error) {
        res.json([]);
    }
});

// End of file
