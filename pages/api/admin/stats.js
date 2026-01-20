export default function handler(req, res) {
    try {
        const fs = require('fs');
        const path = require('path');

        const dataDir = path.join(process.cwd(), 'data');
        const logFile = path.join(dataDir, 'scan_logs.json');

        let logs = [];
        try {
            if (fs.existsSync(logFile)) {
                const fileContent = fs.readFileSync(logFile, 'utf8');
                logs = JSON.parse(fileContent);
            }
        } catch (err) {
            console.error("Error reading logs:", err);
            // logs remains []
        }

        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000;
        const oneWeek = 7 * oneDay;

        let todayCount = 0;
        let weekCount = 0;
        let subjects = {};
        let modes = { kid: 0, parent: 0 };

        logs.forEach(log => {
            const logDate = new Date(log.timestamp);
            const diff = now - logDate;

            if (diff < oneDay) todayCount++;
            if (diff < oneWeek) weekCount++;

            const sub = log.subject || 'unknown';
            subjects[sub] = (subjects[sub] || 0) + 1;

            const mode = log.mode || 'kid';
            modes[mode] = (modes[mode] || 0) + 1;
        });

        const recent = logs.slice(-10).reverse();

        res.status(200).json({
            today: todayCount,
            week: weekCount,
            total: logs.length,
            subjects,
            modes,
            recent
        });
    } catch (error) {
        console.error("Admin stats API critical error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
