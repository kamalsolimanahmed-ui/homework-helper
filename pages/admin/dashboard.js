import { useEffect, useState } from 'react';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [authenticated, setAuthenticated] = useState(false);
    const [error, setError] = useState('');

    const fetchStats = async (pwd) => {
        try {
            setLoading(true);
            setError('');

            const res = await fetch('/api/admin/stats', {
                headers: {
                    'Authorization': `Bearer ${pwd || password}`
                }
            });

            if (res.status === 401) {
                setLoading(false);
                setError('Invalid password');
                setAuthenticated(false);
                return;
            }

            if (!res.ok) throw new Error('Failed to fetch');

            const data = await res.json();
            setStats(data);
            setAuthenticated(true);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Connection error');
            setLoading(false);
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        fetchStats(password);
    };

    // Auto-refresh using saved password state if authenticated
    useEffect(() => {
        if (authenticated) {
            const interval = setInterval(() => fetchStats(password), 30000);
            return () => clearInterval(interval);
        }
    }, [authenticated, password]);

    if (!authenticated) {
        return (
            <div style={styles.loginContainer}>
                <form onSubmit={handleLogin} style={styles.loginBox}>
                    <h2 style={{ color: '#04133A', marginBottom: '20px' }}>Admin Login</h2>
                    <input
                        type="password"
                        placeholder="Enter Admin Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.input}
                    />
                    {error && <p style={{ color: 'red', margin: '10px 0' }}>{error}</p>}
                    <button type="submit" style={styles.button} disabled={loading}>
                        {loading ? 'Checking...' : 'Login'}
                    </button>
                </form>
            </div>
        );
    }

    if (loading && !stats) return <div style={styles.loading}>Loading Dashboard...</div>;
    if (!stats) return <div style={styles.loading}>Error loading stats</div>;

    return (
        <div style={styles.container}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={styles.title}>Admin Dashboard</h1>
                <button onClick={() => setAuthenticated(false)} style={styles.logoutBtn}>Logout</button>
            </div>

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
    loginContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#04133A',
        fontFamily: 'Arial, sans-serif'
    },
    loginBox: {
        background: 'white',
        padding: '40px',
        borderRadius: '12px',
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        width: '100%',
        maxWidth: '400px'
    },
    input: {
        width: '100%',
        padding: '12px',
        fontSize: '16px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        marginBottom: '20px',
        boxSizing: 'border-box'
    },
    button: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        cursor: 'pointer',
        fontWeight: 'bold'
    },
    logoutBtn: {
        padding: '8px 16px',
        backgroundColor: '#f44336',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer'
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
