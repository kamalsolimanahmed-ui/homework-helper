import { useEffect, useState } from 'react';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats');
            const data = await res.json();
            setStats(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div style={styles.loading}>Loading Dashboard...</div>;
    if (!stats) return <div style={styles.loading}>Error loading stats</div>;

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Admin Dashboard</h1>

            <div style={styles.grid}>
                <div style={styles.card}>
                    <h3>Scans Today (24h)</h3>
                    <p style={styles.bigNumber}>{stats.today}</p>
                </div>
                <div style={styles.card}>
                    <h3>Scans This Week</h3>
                    <p style={styles.bigNumber}>{stats.week}</p>
                </div>
                <div style={styles.card}>
                    <h3>Total All Time</h3>
                    <p style={styles.bigNumber}>{stats.total}</p>
                </div>
                <div style={styles.card}>
                    <h3>Mode Breakdown</h3>
                    <p>Kid: {stats.modes.kid}</p>
                    <p>Parent: {stats.modes.parent}</p>
                </div>
            </div>

            <div style={styles.section}>
                <h2>Subject Breakdown</h2>
                <div style={styles.list}>
                    {Object.entries(stats.subjects).map(([sub, count]) => (
                        <div key={sub} style={styles.listItem}>
                            <span>{sub}</span>
                            <strong>{count}</strong>
                        </div>
                    ))}
                </div>
            </div>

            <div style={styles.section}>
                <h2>Recent Scans</h2>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Time</th>
                            <th style={styles.th}>Subject</th>
                            <th style={styles.th}>Topic</th>
                            <th style={styles.th}>Grade</th>
                            <th style={styles.th}>Language</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.recent.map((log, i) => (
                            <tr key={i} style={styles.tr}>
                                <td style={styles.td}>{new Date(log.timestamp).toLocaleTimeString()}</td>
                                <td style={styles.td}>{log.subject}</td>
                                <td style={styles.td}>{log.topic}</td>
                                <td style={styles.td}>{log.grade_level}</td>
                                <td style={styles.td}>{log.language}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const styles = {
    container: {
        padding: '40px',
        backgroundColor: '#f4f6f8',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif',
        color: '#333'
    },
    loading: {
        padding: '50px',
        textAlign: 'center',
        fontSize: '20px'
    },
    title: {
        marginBottom: '30px',
        color: '#04133A'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
    },
    card: {
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        textAlign: 'center'
    },
    bigNumber: {
        fontSize: '36px',
        fontWeight: 'bold',
        color: '#4CAF50',
        margin: '10px 0'
    },
    section: {
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '30px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    },
    list: {
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap',
        marginTop: '15px'
    },
    listItem: {
        background: '#eef2f7',
        padding: '10px 20px',
        borderRadius: '20px',
        display: 'flex',
        gap: '10px'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '15px'
    },
    th: {
        textAlign: 'left',
        padding: '12px',
        borderBottom: '2px solid #eee',
        color: '#666'
    },
    td: {
        padding: '12px',
        borderBottom: '1px solid #eee'
    },
    tr: {
        '&:hover': {
            backgroundColor: '#f9f9f9'
        }
    }
};
