import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
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
        return res.status(200).json({
            today: 0,
            week: 0,
            users: 0,
            subjects: {},
            recent: []
        });
    }

    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;

    let todayCount = 0;
    let weekCount = 0;
    let subjects = {};

    // Use a simple set to estimate unique users (based on some logic if available, or just count sessions)
    // Since we don't have user IDs, we'll just return total scans for now or maybe mode breakdown
    let modes = { kid: 0, parent: 0 };

    logs.forEach(log => {
        const logDate = new Date(log.timestamp);
        const diff = now - logDate;

        if (diff < oneDay) todayCount++;
        if (diff < oneWeek) weekCount++;

        // Tally subjects
        const sub = log.subject || 'unknown';
        subjects[sub] = (subjects[sub] || 0) + 1;

        // Tally modes
        const mode = log.mode || 'kid';
        modes[mode] = (modes[mode] || 0) + 1;
    });

    // Get last 10 logs
    const recent = logs.slice(-10).reverse();

    res.status(200).json({
        today: todayCount,
        week: weekCount,
        total: logs.length,
        subjects,
        modes,
        recent
    });
}
