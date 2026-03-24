import { useProcessedMailStats } from "../hooks/useProcessedMailStats";

export default function Overview({ createdBy }) {
    const { stats, loading } = useProcessedMailStats(createdBy);

    if (loading) return <div>Loading stats...</div>;
    if (!stats) return <div>No stats available.</div>;

    return (
        <div>
            <h2>Processed Mails Overview</h2>
            <ul>
                <li>Total processed: {stats.total}</li>
                <li>Last 7 days: {stats.last7}</li>
                <li>Last 30 days: {stats.last30}</li>
                <li>Last 90 days: {stats.last90}</li>
            </ul>
            <h3>Top Tag Inputs</h3>
            <ol>
                {stats.tagInputStats.map(t => (
                    <li key={t._id}>
                        TagInput ID: {t._id} — {t.count} mails
                    </li>
                ))}
            </ol>
            <h3>Top Patterns</h3>
            <ol>
                {stats.topPatterns.map(p => (
                    <li key={p._id}>
                        Pattern: {p._id} — {p.count} mails
                    </li>
                ))}
            </ol>
        </div>
    );
}
