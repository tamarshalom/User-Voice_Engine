import './App.css'
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import data from './cluster_data.json'

const COLORS = [
  '#60a5fa',
  '#f87171',
  '#34d399',
  '#fbbf24',
  '#a78bfa',
  '#38bdf8',
]

const clusterIds = [...new Set(data.map((item) => item.cluster_id))].sort(
  (a, b) => a - b
)

const pointsByCluster = clusterIds.map((clusterId) => {
  const points = data
    .filter((item) => item.cluster_id === clusterId)
    .map((item) => ({
      ...item,
      x: item.coords?.[0] ?? 0,
      y: item.coords?.[1] ?? 0,
    }))

  const topicName = points[0]?.topic_name || `Cluster ${clusterId}`

  return {
    clusterId,
    points,
    topicName,
  }
})

const insightTopics = [...new Set(data.map((item) => item.topic_name))].filter(
  Boolean
)

const ClusterTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  return (
    <div className="tooltip">
      <p className="tooltip-title">{item.topic_name}</p>
      <p className="tooltip-text">{item.text}</p>
    </div>
  )
}

function App() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">VoiceEngine AI</div>
        <div className="sidebar-section">
          <p className="sidebar-label">Clusters</p>
          <div className="cluster-list">
            {pointsByCluster.map((cluster, index) => (
              <div key={cluster.clusterId} className="cluster-item">
                <span
                  className="cluster-dot"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                {cluster.topicName}
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main className="content">
        <header className="header">
          <div>
            <p className="eyebrow">User Voice Dashboard</p>
            <div className="title-row">
              <span className="spotify-logo" aria-hidden="true">
                <svg viewBox="0 0 168 168" role="img">
                  <circle cx="84" cy="84" r="84" fill="#1DB954" />
                  <path
                    d="M120.1 113.7c-1.6 2.6-5.1 3.4-7.7 1.8-21.2-12.9-47.8-15.8-79.2-8.8-3 0.7-6-1.2-6.7-4.2-0.7-3 1.2-6 4.2-6.7 34.4-7.7 63.7-4.3 87.3 9.8 2.6 1.6 3.4 5.1 1.8 7.7z"
                    fill="#0B0B0B"
                  />
                  <path
                    d="M130.8 88.3c-2 3.2-6.1 4.2-9.3 2.2-24.3-14.9-61.4-19.2-90.1-10.5-3.6 1.1-7.4-1-8.5-4.6-1.1-3.6 1-7.4 4.6-8.5 32.8-9.9 73.7-5.1 101.8 12.4 3.2 2 4.2 6.1 2.2 9.3z"
                    fill="#0B0B0B"
                  />
                  <path
                    d="M140.8 62.9c-2.3 3.7-7.2 4.9-10.9 2.6-28.1-17.2-75.8-18.8-106.4-9.5-4.2 1.3-8.6-1-9.9-5.2-1.3-4.2 1-8.6 5.2-9.9 35-10.6 87.9-8.8 120.7 11.5 3.7 2.3 4.9 7.2 2.6 10.9z"
                    fill="#0B0B0B"
                  />
                </svg>
              </span>
              <h1>Spotify Clustered Feedback Map</h1>
            </div>
            <p className="subhead">
              Hover over a point to see the topic and review text.
            </p>
          </div>
        </header>

        <section className="card">
          <div className="card-header">
            <h2>Scatter Plot</h2>
            <p className="muted">Each dot is one feedback item.</p>
          </div>
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="x"
                  tick={{ fill: '#94a3b8' }}
                  axisLine={{ stroke: '#374151' }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  tick={{ fill: '#94a3b8' }}
                  axisLine={{ stroke: '#374151' }}
                />
                <Tooltip content={<ClusterTooltip />} />
                {pointsByCluster.map((cluster, index) => (
                  <Scatter
                    key={cluster.clusterId}
                    name={`Cluster ${cluster.clusterId}`}
                    data={cluster.points}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card insights">
          <h2>Top Insights</h2>
          <div className="insight-list">
            {insightTopics.map((topic) => (
              <div key={topic} className="insight-item">
                {topic}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
