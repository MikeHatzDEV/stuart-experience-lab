import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { HeaderOperator } from './auth/HeaderOperator'
import { SecuritySettings } from './auth/SecuritySettings'
import { SessionGate } from './auth/SessionGate'
import {
  MOCK_STUART_ROLES,
  MOCK_STUART_USERS,
  MOCK_USER_AUDIT_EVENTS,
} from './auth/mockAuth'
import { useAuth } from './auth/AuthContext'
import { EnvironmentSelector, type Environment } from './EnvironmentSelector'
import { StuartOrb } from './StuartOrb'
import {
  DEFAULT_CORE_LABEL,
  EXPERIENCE_LAB_VERSION_LABEL,
  MOCK_CORE_VERSION_PLACEHOLDER,
} from './app/version'
import './App.css'

// Environment Status footer — answers "What environment am I viewing?"
// Future examples (comment only):
// Preview Build / Mock stewardship data
// Preview Build / Live Signal Lab telemetry
// Production / Connected to Signal Lab
// Production / Connected to ABC Manufacturing
const ENVIRONMENT_STATUS_FOOTER = {
  buildLabel: 'Preview Build',
  dataLabel: 'Mock stewardship data',
} as const

type PageId =
  | 'home'
  | 'operations'
  | 'organizations'
  | 'network'
  | 'services'
  | 'assets'
  | 'audit'
  | 'settings'

const NAV_ITEMS: { id: PageId; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'operations', label: 'Operations Console' },
  { id: 'organizations', label: 'Organizations' },
  { id: 'network', label: 'Network Console' },
  { id: 'services', label: 'Services & Applications' },
  { id: 'assets', label: 'Asset Explorer' },
  { id: 'audit', label: 'Audit' },
  { id: 'settings', label: 'Settings' },
]

const PAGE_META: Record<PageId, { title: string; description: string }> = {
  home: {
    title: 'Home',
    description: 'Your daily starting point — ask Stuart, review awareness, and move into action.',
  },
  operations: {
    title: 'Operations Console',
    description: 'How Master Stuart is running — live resources, connected systems overview, and active work.',
  },
  organizations: {
    title: 'Organizations',
    description: 'Manage Stuart environments, contacts, subscriptions, and relationship context.',
  },
  network: {
    title: 'Network Console',
    description: 'How the network is operating — internet, gateway, access points, devices, and live network events.',
  },
  services: {
    title: 'Services & Applications',
    description: 'Monitor software, services, updates, licenses, and operational stewardship.',
  },
  assets: {
    title: 'Asset Explorer',
    description: 'Investigate observed and registered assets across the environment.',
  },
  audit: {
    title: 'Audit',
    description: 'Searchable history of steward actions, observations, and system events.',
  },
  settings: {
    title: 'Settings',
    description: 'Configure how Stuart communicates, connects, learns, and protects the environment.',
  },
}

// Home = Stuart application landing page.
// Stuart Home = future proprietary home/security/environment hardware ecosystem.
const HOME_QUICK_PROMPTS = [
  'What happened overnight?',
  'Show me critical issues',
  'Any recommendations?',
  'How is Oppure?',
] as const

const HOME_QUICK_ACTIONS: { label: string; page?: PageId }[] = [
  { label: 'Review Briefing' },
  { label: 'Operations Console', page: 'operations' },
  { label: 'Network Console', page: 'network' },
  { label: 'Organizations', page: 'organizations' },
  { label: 'Services & Applications', page: 'services' },
  { label: 'New Investigation', page: 'services' },
]

const HOME_OVERNIGHT_BRIEFING = [
  'Comcast latency increased for 14 minutes',
  'Backblaze backup completed successfully',
  'Oppure renewal due in 41 days',
  'Adobe Acrobat not used in 18 months',
  'John accepted Recommendation #42',
]

const HOME_ORGANIZATIONS_GLANCE = [
  { name: 'Signal Lab', status: 'Healthy', tone: 'ok' as const },
  { name: 'Oppure', status: '1 Recommendation', tone: 'warn' as const },
  { name: 'Maine', status: 'Healthy', tone: 'ok' as const },
  { name: 'ABC Manufacturing', status: '2 Alerts', tone: 'error' as const },
  { name: 'John', status: 'Offline 3 days', tone: 'warn' as const },
]

function HomeAwarenessCard({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="home-awareness-card">
      <div className="home-awareness-card-title">{title}</div>
      <div className="home-awareness-card-body">{children}</div>
    </div>
  )
}

function HomePage({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  const [query, setQuery] = useState('')

  return (
    <div className="home-page">
      <div className="home-layout">
        <div className="home-main">
          <div className="home-greeting">
            <h1 className="home-greeting-primary">Good morning, Michael.</h1>
            <p className="home-greeting-secondary">I&apos;ve been monitoring while you were away.</p>
          </div>

          {/* Stuart Identity Artwork v1 is used as the approved Home presence placeholder.
              A future animated implementation should match this identity rather than replace it. */}
          <StuartOrb />

          <div className="home-chat">
            <div className="home-chat-input-row">
              <button type="button" className="home-chat-icon-btn" aria-label="Voice input">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M19 11a7 7 0 0 1-14 0"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path d="M12 18v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
              <input
                className="home-chat-input"
                type="text"
                value={query}
                placeholder="Ask Stuart anything..."
                onChange={(event) => setQuery(event.target.value)}
              />
              <button type="button" className="home-chat-send-btn" aria-label="Send">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="m5 12 14-7-7 14 3-3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div className="home-prompt-chips">
              {HOME_QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="home-prompt-chip"
                  onClick={() => setQuery(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="home-quick-actions">
            {HOME_QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                type="button"
                className="home-quick-action-card"
                onClick={() => {
                  if (action.page) onNavigate(action.page)
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        <aside className="home-awareness" aria-label="Awareness summary">
          <HomeAwarenessCard title="Overnight Briefing">
            <ul className="home-awareness-list">
              {HOME_OVERNIGHT_BRIEFING.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </HomeAwarenessCard>

          <HomeAwarenessCard title="System Health">
            <div className="home-awareness-stat">All Systems Healthy</div>
            <div className="home-awareness-meta">Health Score: 98</div>
          </HomeAwarenessCard>

          <HomeAwarenessCard title="Active Recommendations">
            <ul className="home-awareness-metrics">
              <li>
                <span className="tone-critical">1</span> Critical
              </li>
              <li>
                <span className="tone-warning">3</span> Important
              </li>
              <li>
                <span>7</span> Informational
              </li>
            </ul>
          </HomeAwarenessCard>

          <HomeAwarenessCard title="Organizations at a Glance">
            <ul className="home-org-glance-list">
              {HOME_ORGANIZATIONS_GLANCE.map((org) => (
                <li key={org.name}>
                  <span className="home-org-glance-name">{org.name}</span>
                  <span className={`home-org-glance-status tone-${org.tone}`}>{org.status}</span>
                </li>
              ))}
            </ul>
          </HomeAwarenessCard>
        </aside>
      </div>
    </div>
  )
}

const MOCK_ENVIRONMENTS: Environment[] = [
  {
    id: 'signal-lab',
    name: 'Signal Lab',
    coreLabel: DEFAULT_CORE_LABEL,
    coreVersion: MOCK_CORE_VERSION_PLACEHOLDER,
  },
  {
    id: 'oppure',
    name: 'Oppure',
    coreLabel: DEFAULT_CORE_LABEL,
    coreVersion: MOCK_CORE_VERSION_PLACEHOLDER,
  },
  {
    id: 'maine',
    name: 'Maine',
    coreLabel: DEFAULT_CORE_LABEL,
    coreVersion: MOCK_CORE_VERSION_PLACEHOLDER,
  },
  {
    id: 'john',
    name: 'John',
    coreLabel: DEFAULT_CORE_LABEL,
    coreVersion: MOCK_CORE_VERSION_PLACEHOLDER,
  },
  {
    id: 'abc-manufacturing',
    name: 'ABC Manufacturing',
    coreLabel: DEFAULT_CORE_LABEL,
    coreVersion: MOCK_CORE_VERSION_PLACEHOLDER,
  },
]

const SETTINGS_CATEGORIES = [
  {
    id: 'communication',
    title: 'Communication',
    description: 'Explanation level, voice, listening, notifications, and conversation behavior.',
  },
  {
    id: 'users',
    title: 'Users',
    description: 'User accounts, roles, permissions, and active sessions.',
  },
  {
    id: 'providers',
    title: 'Providers',
    description: 'External system connections — UniFi, TrueNAS, GitHub, backup platforms, and more.',
  },
  {
    id: 'automation',
    title: 'Automation',
    description: 'Background monitoring, poll intervals, learning rules, and scheduled reports.',
  },
  {
    id: 'intelligence',
    title: 'Intelligence',
    description: 'Internal engines — reality, knowledge, decision, and learning systems.',
  },
  {
    id: 'diagnostics',
    title: 'Diagnostics',
    description: 'Runtime health, performance, logging, and self-test tools.',
  },
  {
    id: 'security',
    title: 'Security',
    description: 'API keys, encryption, certificates, MFA, and session protection.',
  },
  {
    id: 'about',
    title: 'About',
    description: 'Stuart version, build, license, documentation, and release notes.',
  },
]

type SettingsSectionId =
  | 'communication'
  | 'users'
  | 'providers'
  | 'automation'
  | 'intelligence'
  | 'diagnostics'
  | 'security'
  | 'about'

const COMMUNICATION_PROFILES = [
  {
    id: 'beginner',
    title: 'Beginner',
    description: 'Simple explanations with minimal technical detail.',
  },
  {
    id: 'operator',
    title: 'Operator',
    description: 'Uses plain language while still displaying operational detail.',
  },
  {
    id: 'advanced',
    title: 'Advanced',
    description: 'More context, terminology, and system relationships.',
  },
  {
    id: 'engineer',
    title: 'Engineer',
    description: 'Full technical depth for diagnostics and architecture work.',
  },
] as const

const ASSETS = [
  {
    id: 'ap-lounge',
    name: 'AP-Lounge',
    type: 'Access Point',
    status: 'Offline',
    statusClass: 'error' as const,
    ip: '10.77.0.42',
    lastSeen: '12 min ago',
    match: 'Observed',
    detail: 'UniFi U6-Pro — last seen before power loss in lounge area.',
  },
  {
    id: 'truenas-core',
    name: 'TrueNAS-Core',
    type: 'Storage',
    status: 'Healthy',
    statusClass: 'ok' as const,
    ip: '10.77.0.10',
    lastSeen: 'Live',
    match: 'Registered',
    detail: 'Primary NAS — pool signal-lab at 94% capacity, scrub completed 3 days ago.',
  },
  {
    id: 'printer-hr',
    name: 'Printer-HR',
    type: 'Printer',
    status: 'Unreachable',
    statusClass: 'warn' as const,
    ip: '10.77.0.88',
    lastSeen: '2 hr ago',
    match: 'Registered',
    detail: 'HP LaserJet — ICMP timeout; last successful print job reported yesterday.',
  },
  {
    id: 'udm-se',
    name: 'UDM-SE',
    type: 'Gateway',
    status: 'Online',
    statusClass: 'ok' as const,
    ip: '10.77.0.1',
    lastSeen: 'Live',
    match: 'Observed',
    detail: 'UniFi gateway — WAN link up, 940 Mbps down / 35 Mbps up.',
  },
]

function StatusBadge({
  label,
  tone,
}: {
  label: string
  tone: 'ok' | 'warn' | 'error' | 'info'
}) {
  return <span className={`status-badge ${tone}`}>{label}</span>
}

function AskStuartPanel({
  context,
  prompts,
  variant = 'default',
}: {
  context: 'operations' | 'network'
  prompts?: string[]
  variant?: 'default' | 'embedded'
}) {
  const [query, setQuery] = useState('')

  const examples =
    prompts ??
    (context === 'network'
      ? [
          'Why is AP-Lounge offline?',
          'How long has WAN been up?',
          'Which clients are on 5 GHz?',
        ]
      : [
          'Is Stuart healthy?',
          'What is Stuart doing right now?',
          'Which service needs attention?',
        ])

  const hint =
    context === 'network'
      ? 'Ask about network status, connectivity, devices, and what changed.'
      : 'Ask about Stuart health, active work, services, and connected systems.'

  return (
    <div className={`panel ask-stuart-panel${variant === 'embedded' ? ' ask-stuart-embedded' : ''}`}>
      <div>
        <div className="ask-stuart-label">
          {variant === 'embedded' ? (
            <>
              <span className="ask-stuart-icon" aria-hidden="true">◆</span>
              Ask Stuart
            </>
          ) : (
            'Ask Stuart'
          )}
        </div>
        <div className="ask-stuart-hint">{hint}</div>
      </div>
      <div className="ask-stuart-input-row">
        <input
          className="ask-stuart-input"
          type="text"
          value={query}
          placeholder="Type your question…"
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="button" className="ask-stuart-button">
          Ask
        </button>
      </div>
      <div className="ask-stuart-examples">
        {examples.map((example) => (
          <button
            key={example}
            type="button"
            className="ask-example"
            onClick={() => setQuery(example)}
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  )
}

const GRAPH_POINTS = 40

type TimeRangeId = '1m' | '15m' | '1h' | '24h' | '7d'
type TelemetryMetric = 'cpu' | 'memory' | 'gpu' | 'disk'

const TIME_RANGES: { id: TimeRangeId; shortLabel: string; points: number; volatility: number; smoothness: number; spikeChance: number; tickMs: number }[] = [
  { id: '1m', shortLabel: '1m', points: 60, volatility: 6, smoothness: 0.15, spikeChance: 0.07, tickMs: 1000 },
  { id: '15m', shortLabel: '15m', points: 45, volatility: 3.5, smoothness: 0.55, spikeChance: 0.035, tickMs: 3000 },
  { id: '1h', shortLabel: '1h', points: 60, volatility: 2.2, smoothness: 0.72, spikeChance: 0.02, tickMs: 8000 },
  { id: '24h', shortLabel: '24h', points: 48, volatility: 3, smoothness: 0.88, spikeChance: 0.012, tickMs: 20000 },
  { id: '7d', shortLabel: '7d', points: 42, volatility: 4, smoothness: 0.93, spikeChance: 0.006, tickMs: 45000 },
]

const TIME_RANGE_BY_ID = Object.fromEntries(TIME_RANGES.map((r) => [r.id, r])) as Record<TimeRangeId, (typeof TIME_RANGES)[number]>

const METRIC_BASELINES: Record<TelemetryMetric, { base: number; min: number; max: number }> = {
  cpu: { base: 34, min: 12, max: 82 },
  memory: { base: 52, min: 38, max: 78 },
  gpu: { base: 18, min: 4, max: 92 },
  disk: { base: 24, min: 5, max: 95 },
}

function trendOffset(metric: TelemetryMetric, range: TimeRangeId, index: number, total: number) {
  const t = index / Math.max(total - 1, 1)
  if (range === '24h') {
    const dayCycle = Math.sin(t * Math.PI * 2 - Math.PI / 2) * 14
    return metric === 'gpu' ? dayCycle * 1.4 : dayCycle
  }
  if (range === '7d') {
    const weekCycle = Math.sin(t * Math.PI * 2) * 10
    const weekendDip = t > 0.7 && t < 0.95 ? -6 : 0
    return weekCycle + weekendDip
  }
  if (range === '1h') {
    return Math.sin(t * Math.PI * 1.5) * (metric === 'disk' ? 8 : 5)
  }
  if (range === '15m') {
    return Math.sin(t * Math.PI * 2.5) * 4
  }
  return 0
}

function generateMetricSeries(metric: TelemetryMetric, range: TimeRangeId): number[] {
  const config = TIME_RANGE_BY_ID[range]
  const { base, min, max } = METRIC_BASELINES[metric]
  const series: number[] = []
  let value = base + trendOffset(metric, range, 0, config.points)

  for (let i = 0; i < config.points; i++) {
    const target = base + trendOffset(metric, range, i, config.points)
    const noise = (Math.random() - 0.5) * config.volatility
    const prev = series[i - 1] ?? value
    value = prev * config.smoothness + (target + noise) * (1 - config.smoothness)

    if (Math.random() < config.spikeChance) {
      if (metric === 'gpu' || metric === 'disk') {
        value += 18 + Math.random() * 35
      } else {
        value += 10 + Math.random() * 22
      }
    }

    series.push(clamp(value, min, max))
  }

  return series
}

function advanceMetric(metric: TelemetryMetric, prev: number, range: TimeRangeId): number {
  const config = TIME_RANGE_BY_ID[range]
  const { base, min, max } = METRIC_BASELINES[metric]
  let next = prev + (Math.random() - 0.5) * config.volatility
  next = prev * config.smoothness + (base + (Math.random() - 0.5) * config.volatility) * (1 - config.smoothness)

  if (metric === 'gpu' && Math.random() < config.spikeChance * 1.4) {
    next += 12 + Math.random() * 28
  }
  if (metric === 'disk' && Math.random() < config.spikeChance * 1.8) {
    next += 15 + Math.random() * 32
  }
  if (metric === 'cpu' && Math.random() < config.spikeChance) {
    next += 8 + Math.random() * 18
  }

  return clamp(next, min, max)
}

function pushSeries(series: number[], next: number, maxPoints = GRAPH_POINTS) {
  return [...series.slice(-(maxPoints - 1)), next]
}

function GraphRangeSelector({
  value,
  onChange,
  label,
}: {
  value: TimeRangeId
  onChange: (range: TimeRangeId) => void
  label: string
}) {
  return (
    <div
      className="graph-range-selector"
      role="group"
      aria-label={`${label} history range`}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {TIME_RANGES.map((range) => (
        <button
          key={range.id}
          type="button"
          className={`graph-range-btn${value === range.id ? ' active' : ''}`}
          aria-pressed={value === range.id}
          aria-label={`${label} · ${range.shortLabel}`}
          onClick={() => onChange(range.id)}
        >
          {range.shortLabel}
        </button>
      ))}
    </div>
  )
}

function useMetricTelemetry(metric: TelemetryMetric, range: TimeRangeId) {
  const [series, setSeries] = useState(() => generateMetricSeries(metric, range))

  useEffect(() => {
    setSeries(generateMetricSeries(metric, range))
  }, [metric, range])

  useEffect(() => {
    const config = TIME_RANGE_BY_ID[range]
    const tick = window.setInterval(() => {
      setSeries((prev) => {
        const last = prev[prev.length - 1] ?? METRIC_BASELINES[metric].base
        return pushSeries(prev, advanceMetric(metric, last, range), config.points)
      })
    }, config.tickMs)

    return () => window.clearInterval(tick)
  }, [metric, range])

  return series
}

type SeriesTrend = {
  label: string
  arrow: string
}

function computeSeriesStats(values: number[], metric: TelemetryMetric) {
  const { base, min, max } = METRIC_BASELINES[metric]

  if (values.length === 0) {
    return { current: base, average: base, peak: base, trend: { label: 'Stable', arrow: '→' } }
  }

  const current = values[values.length - 1]
  const average = values.reduce((sum, v) => sum + v, 0) / values.length
  const peak = Math.max(...values)

  const segment = Math.max(1, Math.floor(values.length * 0.25))
  const recent = values.slice(-segment)
  const prior = values.slice(-segment * 2, -segment)
  const recentAvg = recent.reduce((sum, v) => sum + v, 0) / recent.length
  const priorAvg = prior.length > 0 ? prior.reduce((sum, v) => sum + v, 0) / prior.length : recentAvg
  const delta = recentAvg - priorAvg
  const threshold = (max - min) * 0.04

  let trend: SeriesTrend
  if (metric === 'gpu' || metric === 'disk') {
    if (current > average * 1.22 && current > base * 1.28) {
      trend = { label: 'Busy', arrow: '↑' }
    } else if (current < average * 0.72 && current < base * 0.85) {
      trend = { label: 'Quiet', arrow: '↓' }
    } else if (delta > threshold) {
      trend = { label: 'Rising', arrow: '↑' }
    } else if (delta < -threshold) {
      trend = { label: 'Falling', arrow: '↓' }
    } else {
      trend = { label: 'Stable', arrow: '→' }
    }
  } else if (delta > threshold) {
    trend = { label: 'Rising', arrow: '↑' }
  } else if (delta < -threshold) {
    trend = { label: 'Falling', arrow: '↓' }
  } else {
    trend = { label: 'Stable', arrow: '→' }
  }

  return { current, average, peak, trend }
}

function GraphStatsRow({
  values,
  metric,
  unit,
}: {
  values: number[]
  metric: TelemetryMetric
  unit: string
}) {
  const { current, average, peak, trend } = computeSeriesStats(values, metric)

  return (
    <div className="graph-stats" aria-label={`${metric} statistics`}>
      <div className="graph-stat">
        <span className="graph-stat-label">Current</span>
        <span className="graph-stat-value is-current">
          {current.toFixed(0)}
          <span className="graph-stat-unit">{unit}</span>
        </span>
      </div>
      <div className="graph-stat">
        <span className="graph-stat-label">Average</span>
        <span className="graph-stat-value">
          {average.toFixed(0)}
          <span className="graph-stat-unit">{unit}</span>
        </span>
      </div>
      <div className="graph-stat">
        <span className="graph-stat-label">Peak</span>
        <span className="graph-stat-value">
          {peak.toFixed(0)}
          <span className="graph-stat-unit">{unit}</span>
        </span>
      </div>
      <div className="graph-stat">
        <span className="graph-stat-label">Trend</span>
        <span className="graph-stat-value is-trend">
          {trend.label}
          <span className="trend-arrow" aria-hidden="true">
            {trend.arrow}
          </span>
        </span>
      </div>
    </div>
  )
}

function OpsTelemetryPanel({
  title,
  subtitle,
  metric,
  unit,
  values,
  color,
  status,
  statusTone,
  timeRange,
  onTimeRangeChange,
}: {
  title: string
  subtitle: string
  metric: TelemetryMetric
  unit: string
  values: number[]
  color: string
  status: string
  statusTone: 'ok' | 'warn' | 'error' | 'info'
  timeRange: TimeRangeId
  onTimeRangeChange: (range: TimeRangeId) => void
}) {
  return (
    <div className="panel live-graph-panel ops-telemetry-panel panel-clickable">
      <div className="panel-header ops-telemetry-header">
        <div className="ops-telemetry-title-block">
          <div className="panel-title">{title}</div>
          <div className="panel-subtitle">{subtitle}</div>
        </div>
        <div className="live-graph-meta">
          <span className="live-pulse" style={{ color }} aria-hidden="true" />
          <StatusBadge label={status} tone={statusTone} />
        </div>
      </div>
      <GraphRangeSelector value={timeRange} onChange={onTimeRangeChange} label={title} />
      <GraphStatsRow values={values} metric={metric} unit={unit} />
      <LiveSparkline values={values} color={color} />
    </div>
  )
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function formatClock(date: Date) {
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

function formatHeaderClockTime(date: Date) {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
}

function formatHeaderClockDate(date: Date) {
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
  const day = date.getDate()
  const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
  return `${weekday} ${day} ${month}`
}

function HeaderClock({ now }: { now: Date }) {
  return (
    <div className="hide-mobile header-clock" aria-label="Current time">
      <span className="header-clock-time">{formatHeaderClockTime(now)}</span>
      <span className="header-clock-date">{formatHeaderClockDate(now)}</span>
    </div>
  )
}

function formatRelativeObservationAge(observedAt: Date, now: Date) {
  const elapsedSeconds = Math.max(0, Math.floor((now.getTime() - observedAt.getTime()) / 1000))
  if (elapsedSeconds < 60) {
    return elapsedSeconds === 1 ? '1 second ago' : `${elapsedSeconds} seconds ago`
  }
  const elapsedMinutes = Math.floor(elapsedSeconds / 60)
  if (elapsedMinutes < 60) {
    return elapsedMinutes === 1 ? '1 minute ago' : `${elapsedMinutes} minutes ago`
  }
  const elapsedHours = Math.floor(elapsedMinutes / 60)
  return elapsedHours === 1 ? '1 hour ago' : `${elapsedHours} hours ago`
}

// Future tooltip on relative freshness:
// Last observation
// 2026-06-29 15:10:52 EDT
function TelemetryFreshnessStat({
  lastObservationAt,
  relativeNow,
}: {
  lastObservationAt: Date
  relativeNow: Date
}) {
  return (
    <div className="ops-live-stat">
      <span className="ops-live-stat-label">Updated</span>
      <span className="ops-telemetry-freshness">
        {formatRelativeObservationAge(lastObservationAt, relativeNow)}
      </span>
    </div>
  )
}

function sparklinePath(
  values: number[],
  width: number,
  height: number,
  pad = 4,
): { line: string; area: string } | null {
  if (values.length === 0) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const step = (width - pad * 2) / Math.max(values.length - 1, 1)

  const coords = values.map((v, i) => {
    const x = pad + i * step
    const y = pad + (height - pad * 2) * (1 - (v - min) / range)
    return `${x},${y}`
  })

  const line = coords.join(' ')
  const area = `${pad},${height - pad} ${line} ${pad + (values.length - 1) * step},${height - pad}`
  return { line, area }
}

function LiveSparkline({
  values,
  color,
  width = 280,
  height = 72,
}: {
  values: number[]
  color: string
  width?: number
  height?: number
}) {
  const paths = sparklinePath(values, width, height)
  if (!paths) return null

  return (
    <svg className="live-sparkline" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polygon className="sparkline-area" points={paths.area} fill={color} fillOpacity={0.12} />
      <polyline className="sparkline-line" points={paths.line} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  )
}

function LiveGraphPanel({
  title,
  subtitle,
  value,
  unit,
  values,
  color,
  status,
  statusTone,
}: {
  title: string
  subtitle: string
  value: string
  unit: string
  values: number[]
  color: string
  status: string
  statusTone: 'ok' | 'warn' | 'error' | 'info'
}) {
  return (
    <button type="button" className="panel panel-clickable live-graph-panel">
      <div className="panel-header">
        <div>
          <div className="panel-title">{title}</div>
          <div className="panel-subtitle">{subtitle}</div>
        </div>
        <div className="live-graph-meta">
          <span className="live-pulse" style={{ color }} aria-hidden="true" />
          <StatusBadge label={status} tone={statusTone} />
        </div>
      </div>
      <div className="live-graph-value">
        {value}
        <span className="live-graph-unit">{unit}</span>
      </div>
      <LiveSparkline values={values} color={color} />
    </button>
  )
}

function StatusTile({
  label,
  value,
  detail,
  tone,
}: {
  label: string
  value: string
  detail: string
  tone: 'ok' | 'warn' | 'error' | 'info'
}) {
  return (
    <button type="button" className={`status-tile tone-${tone} panel-clickable`}>
      <div className="status-tile-top">
        <span className="status-tile-dot" />
        <span className="status-tile-label">{label}</span>
      </div>
      <div className="status-tile-value">{value}</div>
      <div className="status-tile-detail">{detail}</div>
    </button>
  )
}

type FeedEvent = {
  id: string
  time: string
  title: string
  detail: string
  tone: 'ok' | 'warn' | 'error' | 'info'
}

const NETWORK_ACTIVITY_TEMPLATES: Omit<FeedEvent, 'id' | 'time'>[] = [
  {
    title: 'WAN latency spike detected',
    detail: 'Comcast · peaked at {latency} ms · auto-resolving',
    tone: 'warn',
  },
  {
    title: 'AP Office offline',
    detail: 'UniFi · access point disconnected · last seen 10.77.0.42',
    tone: 'error',
  },
  {
    title: 'New wireless client',
    detail: 'iPhone-Steward joined Guest VLAN · 5 GHz association',
    tone: 'info',
  },
  {
    title: 'Gateway CPU elevated',
    detail: 'UDM-SE · CPU {cpu}% for 90 sec · within threshold',
    tone: 'info',
  },
  {
    title: 'Device restored',
    detail: 'Printer-HR responded to ping · back on network',
    tone: 'ok',
  },
  {
    title: 'Packet loss on WAN',
    detail: 'Comcast edge · {loss}% for 30 sec · clearing',
    tone: 'warn',
  },
  {
    title: 'Switch port link up',
    detail: 'USW-Pro-24 port 14 · 1 Gbps · wired client connected',
    tone: 'ok',
  },
  {
    title: 'DNS resolution slow',
    detail: 'Gateway resolver · queries averaging {latency} ms',
    tone: 'warn',
  },
]

const STUART_TASK_TEMPLATES: Omit<FeedEvent, 'id' | 'time'>[] = [
  {
    title: 'Polling UniFi',
    detail: 'Checking gateway, switches, and access points',
    tone: 'info',
  },
  {
    title: 'Checking backup status',
    detail: 'Reviewing Veeam and Backblaze provider signals',
    tone: 'info',
  },
  {
    title: 'Updating timeline',
    detail: 'Recording recent environment changes',
    tone: 'info',
  },
  {
    title: 'Building knowledge',
    detail: 'Correlating new observations with known assets',
    tone: 'info',
  },
  {
    title: 'Refreshing provider health',
    detail: 'Re-checking TrueNAS, GitHub, and Outlook connections',
    tone: 'info',
  },
  {
    title: 'Waiting for next observation cycle',
    detail: 'Reality engine idle · next poll in {secs} sec',
    tone: 'ok',
  },
  {
    title: 'Voice engine retry',
    detail: 'Speech output connection delayed · retrying',
    tone: 'warn',
  },
  {
    title: 'Notification queued',
    detail: 'Steward alert prepared for offline access point',
    tone: 'warn',
  },
]

const STUART_SERVICES = [
  {
    name: 'Reality Engine',
    status: 'Healthy',
    tone: 'ok' as const,
    lastActivity: '12 sec ago',
    description: 'Watching the environment for changes.',
  },
  {
    name: 'Knowledge Engine',
    status: 'Healthy',
    tone: 'ok' as const,
    lastActivity: '28 sec ago',
    description: 'Matching observations to known assets.',
  },
  {
    name: 'Timeline Engine',
    status: 'Healthy',
    tone: 'ok' as const,
    lastActivity: '45 sec ago',
    description: 'Recording what happened and when.',
  },
  {
    name: 'Learning Engine',
    status: 'Attention',
    tone: 'warn' as const,
    lastActivity: '2 min ago',
    description: 'Processing a backlog of new device patterns.',
  },
  {
    name: 'Notification Engine',
    status: 'Healthy',
    tone: 'ok' as const,
    lastActivity: '1 min ago',
    description: 'Delivering steward alerts when needed.',
  },
  {
    name: 'Voice Engine',
    status: 'Healthy',
    tone: 'ok' as const,
    lastActivity: '18 sec ago',
    description: 'Ready for spoken responses.',
  },
]

const STUART_PROVIDERS = [
  {
    name: 'UniFi',
    status: 'Connected',
    tone: 'ok' as const,
    lastChecked: '30 sec ago',
    detail: 'Gateway and devices responding.',
    purpose: 'Monitors network devices, clients, and gateway health.',
  },
  {
    name: 'TrueNAS',
    status: 'Connected',
    tone: 'ok' as const,
    lastChecked: '1 min ago',
    detail: 'Storage pool signals received.',
    purpose: 'Tracks storage pools, capacity, and scrub status.',
  },
  {
    name: 'Veeam',
    status: 'Connected',
    tone: 'ok' as const,
    lastChecked: '4 min ago',
    detail: 'Last backup job reported successfully.',
    purpose: 'Observes on-site backup job completion and health.',
  },
  {
    name: 'Backblaze',
    status: 'Connected',
    tone: 'ok' as const,
    lastChecked: '6 min ago',
    detail: 'Cloud sync status current.',
    purpose: 'Monitors off-site cloud backup sync status.',
  },
  {
    name: 'GitHub',
    status: 'Connected',
    tone: 'ok' as const,
    lastChecked: '12 min ago',
    detail: 'Repository webhooks active.',
    purpose: 'Watches repository activity and deployment signals.',
  },
  {
    name: 'Outlook',
    status: 'Attention',
    tone: 'warn' as const,
    lastChecked: '22 min ago',
    detail: 'Token refresh needed soon.',
    purpose: 'Sends steward notifications and reads calendar context.',
  },
  {
    name: 'OpenAI',
    status: 'Connected',
    tone: 'ok' as const,
    lastChecked: '8 sec ago',
    detail: 'Language model requests available.',
    purpose: 'Powers natural-language understanding and responses.',
  },
]

function renderNetworkDetail(template: string, latency: number, loss: number) {
  return template
    .replace('{latency}', String(Math.round(latency)))
    .replace('{loss}', loss < 0.05 ? '0.0' : loss.toFixed(1))
    .replace('{cpu}', String(18 + Math.floor(Math.random() * 25)))
}

function renderTaskDetail(template: string) {
  return template.replace('{secs}', String(15 + Math.floor(Math.random() * 45)))
}

function seedFeed(templates: Omit<FeedEvent, 'id' | 'time'>[], count: number, render?: (t: string) => string): FeedEvent[] {
  const now = new Date()
  return templates.slice(0, count).map((item, index) => ({
    ...item,
    id: `seed-${index}`,
    time: formatClock(new Date(now.getTime() - index * 47_000)),
    detail: render ? render(item.detail) : item.detail,
  }))
}

function LiveFeedPanel({
  title,
  subtitle,
  events,
}: {
  title: string
  subtitle: string
  events: FeedEvent[]
}) {
  return (
    <div className="panel panel-clickable ops-activity-panel">
      <div className="panel-header">
        <div>
          <div className="panel-title">{title}</div>
          <div className="panel-subtitle">{subtitle}</div>
        </div>
        <div className="live-graph-meta">
          <span className="live-pulse" style={{ color: 'var(--telemetry)' }} aria-hidden="true" />
          <StatusBadge label="Live" tone="info" />
        </div>
      </div>
      <ul className="ops-activity-list">
        {events.map((event, index) => (
          <li
            key={event.id}
            className={`ops-activity-item tone-${event.tone}${index === 0 ? ' is-new' : ''}`}
          >
            <div className="ops-activity-time">{event.time}</div>
            <div className="ops-activity-body">
              <strong>{event.title}</strong>
              <span>{event.detail}</span>
            </div>
            <span className={`ops-activity-marker tone-${event.tone}`} aria-hidden="true" />
          </li>
        ))}
      </ul>
    </div>
  )
}

function ConnectedSystemsOverview() {
  const attentionCount = STUART_PROVIDERS.filter((p) => p.tone === 'warn').length

  return (
    <div className="panel connected-systems-overview panel-clickable">
      <div className="panel-header">
        <div>
          <div className="panel-title">Connected Systems</div>
          <div className="panel-subtitle">Quick overview — open Services & Applications for full detail</div>
        </div>
        <StatusBadge
          label={attentionCount > 0 ? `${attentionCount} need attention` : `${STUART_PROVIDERS.length} connected`}
          tone={attentionCount > 0 ? 'warn' : 'ok'}
        />
      </div>
      <div className="connected-systems-strip">
        {STUART_PROVIDERS.map((provider) => (
          <StatusTile
            key={provider.name}
            label={provider.name}
            value={provider.status}
            detail={`Checked ${provider.lastChecked}`}
            tone={provider.tone}
          />
        ))}
      </div>
    </div>
  )
}

type StewardshipKind = 'service' | 'application'
type StewardshipStatus = 'Healthy' | 'Attention' | 'Critical' | 'Stale' | 'License Review'

type StewardshipItem = {
  id: string
  name: string
  kind: StewardshipKind
  healthLabel: string
  healthTone: 'ok' | 'warn' | 'error' | 'info'
  stewardshipStatus: StewardshipStatus
  vendor: string
  criticality: string
  installedOn: string
  businessOwner: string
  currentVersion: string
  latestKnownVersion: string
  versionStatus: string
  lastUpdated: string
  stalenessType: string
  stalenessDetail: string
  runningState: string
  lastSuccessfulCheck: string
  lastFailure: string
  confidence: string
  licenseStatus: string
  renewalDate: string
  monthlyCost: string
  seatsUsed: string
  dependsOn: string[]
  protectsSupports: string[]
  relatedAssets: string[]
  relatedRecommendations: string[]
  observation: string
  reason: string
  recommendedAction: string
  priority: string
}

const STEWARDSHIP_ITEMS: StewardshipItem[] = [
  {
    id: 'unifi-network',
    name: 'UniFi Network',
    kind: 'service',
    healthLabel: 'Healthy',
    healthTone: 'ok',
    stewardshipStatus: 'Healthy',
    vendor: 'Ubiquiti',
    criticality: 'Critical',
    installedOn: 'TrueNAS VM · unifi-controller',
    businessOwner: 'Michael',
    currentVersion: '9.1.120',
    latestKnownVersion: '9.1.120',
    versionStatus: 'Current',
    lastUpdated: '2026-05-18',
    stalenessType: 'None',
    stalenessDetail: 'No staleness detected.',
    runningState: 'Running',
    lastSuccessfulCheck: '30 seconds ago',
    lastFailure: 'None in 14 days',
    confidence: '99%',
    licenseStatus: 'Included with hardware',
    renewalDate: 'Not applicable',
    monthlyCost: '$0',
    seatsUsed: 'N/A',
    dependsOn: ['TrueNAS SMB', 'Windows Update'],
    protectsSupports: ['Gateway', 'Switches', 'Access Points'],
    relatedAssets: ['UDM-Pro', 'USW-24', 'AP-Lounge'],
    relatedRecommendations: [],
    observation: 'UniFi controller is reachable and reporting expected device inventory.',
    reason: 'All managed devices responded during the last poll cycle.',
    recommendedAction: 'No action required.',
    priority: 'Low',
  },
  {
    id: 'veeam-agent',
    name: 'Veeam Agent',
    kind: 'service',
    healthLabel: 'Attention',
    healthTone: 'warn',
    stewardshipStatus: 'Attention',
    vendor: 'Veeam',
    criticality: 'Critical',
    installedOn: 'MSI · Stuart host',
    businessOwner: 'Michael',
    currentVersion: '6.1.2.349',
    latestKnownVersion: '6.1.2.349',
    versionStatus: 'Current',
    lastUpdated: '2026-04-02',
    stalenessType: 'Operational Staleness',
    stalenessDetail: 'Veeam has not completed a backup in 4 days.',
    runningState: 'Running · job overdue',
    lastSuccessfulCheck: '4 days ago',
    lastFailure: 'Job skipped · host unavailable',
    confidence: '94%',
    licenseStatus: 'Licensed',
    renewalDate: '2026-11-01',
    monthlyCost: '$0',
    seatsUsed: '1 of 1',
    dependsOn: ['TrueNAS SMB', 'Windows Update'],
    protectsSupports: ['Stuart host', 'Operator workstation'],
    relatedAssets: ['MSI-Stuart', 'Backup repository'],
    relatedRecommendations: ['Verify backup schedule', 'Confirm repository free space'],
    observation: 'Veeam agent is running but no successful backup completed recently.',
    reason: 'Last backup job did not finish during the expected nightly window.',
    recommendedAction: 'Run a manual backup and verify repository connectivity.',
    priority: 'High',
  },
  {
    id: 'backblaze',
    name: 'Backblaze',
    kind: 'service',
    healthLabel: 'Attention',
    healthTone: 'warn',
    stewardshipStatus: 'Attention',
    vendor: 'Backblaze',
    criticality: 'High',
    installedOn: 'MSI · cloud sync agent',
    businessOwner: 'Michael',
    currentVersion: '9.0.2.4841',
    latestKnownVersion: '9.0.2.4841',
    versionStatus: 'Current',
    lastUpdated: '2026-03-10',
    stalenessType: 'Configuration Staleness',
    stalenessDetail: 'Backblaze no longer protects Documents.',
    runningState: 'Running · partial coverage',
    lastSuccessfulCheck: '18 minutes ago',
    lastFailure: 'Excluded folder detected',
    confidence: '91%',
    licenseStatus: 'Active subscription',
    renewalDate: '2026-09-15',
    monthlyCost: '$9',
    seatsUsed: '1 device',
    dependsOn: ['Windows Update'],
    protectsSupports: ['Desktop', 'Pictures'],
    relatedAssets: ['MSI-Stuart', 'Documents folder'],
    relatedRecommendations: ['Restore Documents protection'],
    observation: 'Backblaze is online but a protected folder was removed from the backup set.',
    reason: 'Documents path changed after a local folder reorganization.',
    recommendedAction: 'Re-add Documents to the protected set and confirm sync.',
    priority: 'Medium',
  },
  {
    id: 'windows-update',
    name: 'Windows Update',
    kind: 'service',
    healthLabel: 'Stale',
    healthTone: 'warn',
    stewardshipStatus: 'Stale',
    vendor: 'Microsoft',
    criticality: 'High',
    installedOn: 'MSI · OS service',
    businessOwner: 'Michael',
    currentVersion: 'KB5058499',
    latestKnownVersion: 'KB5060999',
    versionStatus: 'Behind',
    lastUpdated: '2026-04-28',
    stalenessType: 'Version Staleness',
    stalenessDetail: 'Pending quality update not installed.',
    runningState: 'Running · updates pending',
    lastSuccessfulCheck: '2 hours ago',
    lastFailure: 'Install deferred by policy',
    confidence: '88%',
    licenseStatus: 'Included with Windows',
    renewalDate: 'Not applicable',
    monthlyCost: '$0',
    seatsUsed: 'N/A',
    dependsOn: [],
    protectsSupports: ['Operating system', 'All installed services'],
    relatedAssets: ['MSI-Stuart'],
    relatedRecommendations: ['Schedule maintenance window'],
    observation: 'Windows Update service is healthy but updates are pending installation.',
    reason: 'Operator deferred the last maintenance reboot.',
    recommendedAction: 'Schedule a maintenance window to apply pending updates.',
    priority: 'Medium',
  },
  {
    id: 'truenas-smb',
    name: 'TrueNAS SMB',
    kind: 'service',
    healthLabel: 'Attention',
    healthTone: 'warn',
    stewardshipStatus: 'Attention',
    vendor: 'TrueNAS',
    criticality: 'Critical',
    installedOn: 'TrueNAS-Core',
    businessOwner: 'Michael',
    currentVersion: '24.10.2',
    latestKnownVersion: '24.10.2',
    versionStatus: 'Current',
    lastUpdated: '2026-05-01',
    stalenessType: 'Knowledge Staleness',
    stalenessDetail: 'TrueNAS SMB has not been verified in 45 days.',
    runningState: 'Running',
    lastSuccessfulCheck: '45 days ago',
    lastFailure: 'None recorded',
    confidence: '76%',
    licenseStatus: 'Community edition',
    renewalDate: 'Not applicable',
    monthlyCost: '$0',
    seatsUsed: 'N/A',
    dependsOn: ['UniFi Network'],
    protectsSupports: ['Shared storage', 'Backup targets', 'Media shares'],
    relatedAssets: ['TrueNAS-Core', 'Share-Operations'],
    relatedRecommendations: ['Run share verification', 'Review SMB permissions'],
    observation: 'SMB shares appear online but stewardship verification is overdue.',
    reason: 'No recent operator or Stuart verification of share permissions and accessibility.',
    recommendedAction: 'Run a share access verification from a managed workstation.',
    priority: 'Medium',
  },
  {
    id: 'chrome',
    name: 'Chrome',
    kind: 'application',
    healthLabel: 'Attention',
    healthTone: 'warn',
    stewardshipStatus: 'Attention',
    vendor: 'Google',
    criticality: 'Medium',
    installedOn: 'MSI · operator workstation',
    businessOwner: 'Michael',
    currentVersion: '137.0.7151.56',
    latestKnownVersion: '139.0.7258.42',
    versionStatus: 'Behind',
    lastUpdated: '2026-05-12',
    stalenessType: 'Version Staleness',
    stalenessDetail: 'Chrome is 2 versions behind.',
    runningState: 'Installed',
    lastSuccessfulCheck: 'Today · 06:40',
    lastFailure: 'None',
    confidence: '97%',
    licenseStatus: 'Free',
    renewalDate: 'Not applicable',
    monthlyCost: '$0',
    seatsUsed: '1 user',
    dependsOn: ['Windows Update'],
    protectsSupports: ['Operator browsing', 'Stuart web console'],
    relatedAssets: ['MSI-Stuart'],
    relatedRecommendations: ['Update Chrome to latest stable'],
    observation: 'Chrome is in active use but not on the latest stable release.',
    reason: 'Automatic updates were paused during a recent troubleshooting session.',
    recommendedAction: 'Resume updates or install the latest stable build.',
    priority: 'Medium',
  },
  {
    id: 'microsoft-365',
    name: 'Microsoft 365',
    kind: 'application',
    healthLabel: 'Current',
    healthTone: 'ok',
    stewardshipStatus: 'Healthy',
    vendor: 'Microsoft',
    criticality: 'High',
    installedOn: 'Cloud + local Office apps',
    businessOwner: 'Michael',
    currentVersion: '2505',
    latestKnownVersion: '2505',
    versionStatus: 'Current',
    lastUpdated: '2026-06-01',
    stalenessType: 'None',
    stalenessDetail: 'No staleness detected.',
    runningState: 'Active',
    lastSuccessfulCheck: '1 hour ago',
    lastFailure: 'None in 30 days',
    confidence: '99%',
    licenseStatus: 'Licensed',
    renewalDate: '2027-01-15',
    monthlyCost: '$12.50',
    seatsUsed: '2 of 5',
    dependsOn: ['Windows Update'],
    protectsSupports: ['Email', 'Documents', 'Collaboration'],
    relatedAssets: ['Outlook', 'OneDrive'],
    relatedRecommendations: [],
    observation: 'Microsoft 365 subscription and apps are current.',
    reason: 'License, client build, and sign-in health are within policy.',
    recommendedAction: 'No action required.',
    priority: 'Low',
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    kind: 'application',
    healthLabel: 'License Review',
    healthTone: 'info',
    stewardshipStatus: 'License Review',
    vendor: 'Intuit',
    criticality: 'Medium',
    installedOn: 'ABC workstation',
    businessOwner: 'Jane Smith',
    currentVersion: '2024 R8',
    latestKnownVersion: '2024 R8',
    versionStatus: 'Current',
    lastUpdated: '2026-02-14',
    stalenessType: 'None',
    stalenessDetail: 'License renewal approaching.',
    runningState: 'Installed',
    lastSuccessfulCheck: 'Yesterday',
    lastFailure: 'None',
    confidence: '93%',
    licenseStatus: 'Renewal due soon',
    renewalDate: '2026-07-15',
    monthlyCost: '$38',
    seatsUsed: '1 of 1',
    dependsOn: ['Windows Update'],
    protectsSupports: ['Accounts payable', 'Invoicing'],
    relatedAssets: ['ABC-Accounting-PC'],
    relatedRecommendations: ['Confirm renewal with billing contact'],
    observation: 'QuickBooks is current but license renewal is approaching.',
    reason: 'Annual subscription enters renewal window in 45 days.',
    recommendedAction: 'Confirm renewal approval with Jane Smith.',
    priority: 'Medium',
  },
  {
    id: 'adobe-acrobat',
    name: 'Adobe Acrobat',
    kind: 'application',
    healthLabel: 'Stale',
    healthTone: 'warn',
    stewardshipStatus: 'Stale',
    vendor: 'Adobe',
    criticality: 'Low',
    installedOn: 'MSI · operator workstation',
    businessOwner: 'Michael',
    currentVersion: '2023.008.20470',
    latestKnownVersion: '2025.001.20643',
    versionStatus: 'Behind',
    lastUpdated: '2024-12-02',
    stalenessType: 'Usage Staleness',
    stalenessDetail: 'Adobe Acrobat has not been opened in 18 months.',
    runningState: 'Installed · inactive',
    lastSuccessfulCheck: '18 months ago',
    lastFailure: 'None',
    confidence: '82%',
    licenseStatus: 'Licensed',
    renewalDate: '2026-08-01',
    monthlyCost: '$14.99',
    seatsUsed: '1 of 1',
    dependsOn: ['Windows Update'],
    protectsSupports: ['PDF review'],
    relatedAssets: ['MSI-Stuart'],
    relatedRecommendations: ['Review license need', 'Consider removal'],
    observation: 'Acrobat remains installed but shows no recent usage.',
    reason: 'No launch events observed in 18 months.',
    recommendedAction: 'Confirm whether the license is still needed or remove the application.',
    priority: 'Low',
  },
  {
    id: 'cursor',
    name: 'Cursor',
    kind: 'application',
    healthLabel: 'Healthy',
    healthTone: 'ok',
    stewardshipStatus: 'Healthy',
    vendor: 'Cursor',
    criticality: 'Medium',
    installedOn: 'MSI · operator workstation',
    businessOwner: 'Michael',
    currentVersion: '1.2.4',
    latestKnownVersion: '1.2.4',
    versionStatus: 'Current',
    lastUpdated: '2026-06-20',
    stalenessType: 'None',
    stalenessDetail: 'No staleness detected.',
    runningState: 'Active',
    lastSuccessfulCheck: 'Today · 07:05',
    lastFailure: 'None',
    confidence: '98%',
    licenseStatus: 'Pro subscription',
    renewalDate: '2026-12-01',
    monthlyCost: '$20',
    seatsUsed: '1 of 1',
    dependsOn: ['Windows Update', 'Chrome'],
    protectsSupports: ['Stuart prototype development'],
    relatedAssets: ['MSI-Stuart', 'Stuart prototype repo'],
    relatedRecommendations: [],
    observation: 'Cursor is current and actively used for prototype development work.',
    reason: 'Version, license, and recent usage all align with stewardship policy.',
    recommendedAction: 'No action required.',
    priority: 'Low',
  },
]

const STEWARDSHIP_SUMMARY = {
  healthy: 42,
  requireAttention: 3,
  critical: 1,
  outdated: 6,
  licensesExpiring: 2,
}

function stewardshipStatusTone(status: StewardshipStatus): 'ok' | 'warn' | 'error' | 'info' {
  if (status === 'Healthy') return 'ok'
  if (status === 'Critical') return 'error'
  if (status === 'License Review') return 'info'
  return 'warn'
}

function stewardshipKindLabel(kind: StewardshipKind) {
  return kind === 'service' ? 'Service' : 'Application'
}

function stewardshipDetailTitle(kind: StewardshipKind) {
  return kind === 'service' ? 'Service Stewardship' : 'Application Stewardship'
}

const STEWARDSHIP_TYPE_SUMMARY = {
  services: '5 monitored · 3 need attention',
  applications: '5 tracked · 2 stale · 1 license review',
}

// Summary cards throughout the Experience Lab should eventually behave as
// investigation filters, not passive metrics. Implemented here first.
//
// Experience Lab workflow (Services & Applications prototype):
// Summary Card → Filter → Selection → Stuart Briefing → More Details... →
// Investigation Workspace → Operator Action
// This pattern will later apply to Operations, Audit, Organizations, Network,
// Asset Explorer, and Projects.
type StewardshipFilterId =
  | 'services'
  | 'applications'
  | 'healthy'
  | 'require-attention'
  | 'critical'
  | 'outdated'
  | 'licenses-expiring'

const STEWARDSHIP_FILTER_LABELS: Record<StewardshipFilterId, string> = {
  services: 'Services',
  applications: 'Applications',
  healthy: 'Healthy',
  'require-attention': 'Require Attention',
  critical: 'Critical',
  outdated: 'Outdated',
  'licenses-expiring': 'Licenses Expiring',
}

function matchesStewardshipFilter(item: StewardshipItem, filter: StewardshipFilterId): boolean {
  switch (filter) {
    case 'services':
      return item.kind === 'service'
    case 'applications':
      return item.kind === 'application'
    case 'healthy':
      return item.stewardshipStatus === 'Healthy'
    case 'require-attention':
      return item.stewardshipStatus === 'Attention'
    case 'critical':
      return item.criticality === 'Critical'
    case 'outdated':
      return item.stewardshipStatus === 'Stale' || item.versionStatus === 'Behind'
    case 'licenses-expiring':
      return item.stewardshipStatus === 'License Review'
  }
}

function filterStewardshipItems(
  items: StewardshipItem[],
  filter: StewardshipFilterId | null,
): StewardshipItem[] {
  if (!filter) return items
  return items.filter((item) => matchesStewardshipFilter(item, filter))
}

type StewardshipSummaryCardProps = {
  filterId: StewardshipFilterId
  label: string
  active: boolean
  onSelect: (filterId: StewardshipFilterId) => void
  children: ReactNode
}

function StewardshipSummaryCard({
  filterId,
  label,
  active,
  onSelect,
  children,
}: StewardshipSummaryCardProps) {
  return (
    <button
      type="button"
      className={`audit-summary-card stewardship-summary-card${active ? ' active' : ''}`}
      aria-pressed={active}
      onClick={() => onSelect(filterId)}
    >
      <div className="audit-summary-label">{label}</div>
      {children}
    </button>
  )
}

type StewardshipRelatedItem = {
  label: string
  category: 'Asset' | 'Audit History' | 'Organization' | 'Project'
}

function buildStewardshipRelatedSystems(item: StewardshipItem): StewardshipRelatedItem[] {
  const assets = item.relatedAssets.map((label) => ({ label, category: 'Asset' as const }))
  return [
    ...assets,
    {
      label: 'Signal Lab Systems',
      category: 'Organization',
    },
    {
      label: `${item.name} · last stewardship review`,
      category: 'Audit History',
    },
    {
      label: `${item.name} remediation`,
      category: 'Project',
    },
  ]
}

const STEWARDSHIP_RELATED_SYSTEM_GROUPS: {
  category: StewardshipRelatedItem['category']
  title: string
}[] = [
  { category: 'Asset', title: 'Assets' },
  { category: 'Organization', title: 'Organizations' },
  { category: 'Audit History', title: 'Audit History' },
  { category: 'Project', title: 'Projects' },
]

function buildStewardshipExecutiveSummary(item: StewardshipItem): string {
  const isOperational =
    item.runningState.toLowerCase().includes('running') ||
    item.runningState.toLowerCase().includes('active') ||
    item.runningState.toLowerCase().includes('installed')

  if (item.stewardshipStatus === 'Healthy') {
    return `${item.name} is operating within Stuart's stewardship expectations. ${item.observation}`
  }

  if (isOperational) {
    return `${item.name} is functioning, but Stuart has identified a stewardship concern. ${item.reason}`
  }

  return `${item.name} requires operator review. ${item.observation}`
}

function parseStewardshipConfidencePercent(confidence: string): number {
  const match = confidence.match(/(\d+)/)
  return match ? Number(match[1]) : 0
}

function stewardshipConfidenceLevel(percent: number): string {
  if (percent >= 90) return 'High Confidence'
  if (percent >= 75) return 'Moderate Confidence'
  return 'Low Confidence'
}

function buildStewardshipBusinessImpact(item: StewardshipItem): string {
  const ownerLabel = item.kind === 'service' ? 'Technical owner' : 'Business owner'
  return `${ownerLabel} ${item.businessOwner} and supporting systems such as ${item.protectsSupports.join(', ')} may be affected while this remains unresolved. Stuart rates overall criticality as ${item.criticality}.`
}

function buildStewardshipEvidence(item: StewardshipItem): string[] {
  const evidence = [
    item.stalenessDetail,
    `Last successful check: ${item.lastSuccessfulCheck}`,
    `Running state: ${item.runningState}`,
  ]
  if (item.lastFailure && !item.lastFailure.startsWith('None')) {
    evidence.push(`Last failure: ${item.lastFailure}`)
  }
  return evidence
}

function buildStewardshipRecommendedActions(item: StewardshipItem): string[] {
  const actions = [item.recommendedAction]
  for (const recommendation of item.relatedRecommendations) {
    if (!actions.includes(recommendation)) {
      actions.push(recommendation)
    }
  }
  return actions
}

type StuartBriefingPanelProps = {
  item: StewardshipItem
  onClose: () => void
}

function StuartBriefingPanel({ item, onClose }: StuartBriefingPanelProps) {
  const relatedSystems = buildStewardshipRelatedSystems(item)
  const evidence = buildStewardshipEvidence(item)
  const recommendedActions = buildStewardshipRecommendedActions(item)
  const confidencePercent = parseStewardshipConfidencePercent(item.confidence)
  const confidenceLevel = stewardshipConfidenceLevel(confidencePercent)

  return (
    <>
      <button
        type="button"
        className="audit-drawer-overlay"
        aria-label="Close Stuart briefing"
        onClick={onClose}
      />
      <aside className="audit-drawer briefing-drawer" aria-label="Stuart Briefing">
        <div className="audit-drawer-header">
          <div>
            <div className="audit-drawer-eyebrow">Stuart Briefing</div>
            <div className="audit-drawer-title">{item.name}</div>
          </div>
          <button
            type="button"
            className="audit-drawer-close"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="audit-drawer-body">
          <section className="audit-drawer-section briefing-lead-section">
            <h3 className="audit-drawer-section-title">Executive Summary</h3>
            <p className="briefing-section-text briefing-executive-summary">
              {buildStewardshipExecutiveSummary(item)}
            </p>
          </section>

          <section className="audit-drawer-section">
            <h3 className="audit-drawer-section-title">Observation</h3>
            <p className="briefing-section-text">{item.observation}</p>
          </section>

          <section className="audit-drawer-section">
            <h3 className="audit-drawer-section-title">Why Stuart Believes This</h3>
            <p className="briefing-section-text">{item.reason}</p>
          </section>

          <section className="audit-drawer-section">
            <h3 className="audit-drawer-section-title">Confidence</h3>
            <div className="briefing-confidence">
              <span className="briefing-confidence-level">{confidenceLevel}</span>
              <span className="audit-confidence">{item.confidence}</span>
            </div>
          </section>

          <section className="audit-drawer-section">
            <h3 className="audit-drawer-section-title">Business Impact</h3>
            <p className="briefing-section-text">{buildStewardshipBusinessImpact(item)}</p>
          </section>

          <section className="audit-drawer-section">
            <h3 className="audit-drawer-section-title">Recommended Actions</h3>
            <ul className="briefing-action-checklist">
              {recommendedActions.map((action) => (
                <li key={action} className="briefing-action-item">
                  <span className="briefing-action-box" aria-hidden="true">
                    ☐
                  </span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="audit-drawer-section">
            <h3 className="audit-drawer-section-title">Related Systems</h3>
            {STEWARDSHIP_RELATED_SYSTEM_GROUPS.map((group) => {
              const items = relatedSystems.filter((related) => related.category === group.category)
              if (items.length === 0) return null
              return (
                <div key={group.category} className="briefing-related-group">
                  <div className="briefing-related-group-title">{group.title}</div>
                  <ul className="briefing-related-list">
                    {items.map((related) => (
                      <li key={`${related.category}-${related.label}`}>
                        <button type="button" className="briefing-related-link">
                          {related.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </section>

          <details className="briefing-technical-details">
            <summary className="briefing-technical-details-summary">Technical Details</summary>
            <div className="briefing-technical-details-body">
              <div className="briefing-technical-block">
                <div className="briefing-technical-label">Evidence</div>
                <ul className="audit-drawer-list">
                  {evidence.map((entry) => (
                    <li key={entry}>{entry}</li>
                  ))}
                </ul>
              </div>
              <div className="briefing-technical-block">
                <div className="briefing-technical-label">Provider Observations</div>
                <p className="briefing-section-text">{item.observation}</p>
              </div>
              <div className="briefing-technical-block">
                <div className="briefing-technical-label">Dependencies</div>
                <p className="briefing-section-text">
                  {item.dependsOn.length > 0 ? item.dependsOn.join(', ') : 'None recorded'}
                </p>
              </div>
              <div className="briefing-technical-block">
                <div className="briefing-technical-label">Timeline References</div>
                <ul className="audit-drawer-list">
                  <li>Last updated: {item.lastUpdated}</li>
                  <li>Last successful check: {item.lastSuccessfulCheck}</li>
                  <li>Last failure: {item.lastFailure}</li>
                </ul>
              </div>
              <div className="briefing-technical-block">
                <div className="briefing-technical-label">Error IDs</div>
                <p className="briefing-section-text briefing-mono">STW-{item.id.toUpperCase()}</p>
              </div>
            </div>
          </details>
        </div>

        <div className="briefing-drawer-footer">
          <button type="button" className="settings-action-btn primary">
            Accept Recommendation
          </button>
          <button type="button" className="settings-action-btn">
            Create Project
          </button>
          <button type="button" className="settings-action-btn">
            Dismiss
          </button>
          <button type="button" className="settings-action-btn briefing-more-details-btn" disabled>
            More Details...
          </button>
        </div>
      </aside>
    </>
  )
}

function ServicesApplicationsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(STEWARDSHIP_ITEMS[0].id)
  const [activeFilter, setActiveFilter] = useState<StewardshipFilterId | null>(null)
  const [briefingOpen, setBriefingOpen] = useState(false)

  const filteredItems = useMemo(
    () => filterStewardshipItems(STEWARDSHIP_ITEMS, activeFilter),
    [activeFilter],
  )
  const filteredServices = useMemo(
    () => filteredItems.filter((item) => item.kind === 'service'),
    [filteredItems],
  )
  const filteredApplications = useMemo(
    () => filteredItems.filter((item) => item.kind === 'application'),
    [filteredItems],
  )

  const selected =
    selectedId !== null
      ? (STEWARDSHIP_ITEMS.find((item) => item.id === selectedId) ?? null)
      : null

  const selectFilter = useCallback((filter: StewardshipFilterId) => {
    const nextFiltered = filterStewardshipItems(STEWARDSHIP_ITEMS, filter)
    setActiveFilter(filter)
    setSelectedId((current) => {
      if (current && nextFiltered.some((item) => item.id === current)) return current
      return nextFiltered[0]?.id ?? null
    })
  }, [])

  const clearFilter = useCallback(() => {
    setActiveFilter(null)
  }, [])

  const closeBriefing = useCallback(() => {
    setBriefingOpen(false)
  }, [])

  useEffect(() => {
    if (!selected) {
      setBriefingOpen(false)
    }
  }, [selected])

  const renderNavItem = (item: StewardshipItem) => (
    <button
      key={item.id}
      type="button"
      className={`settings-nav-item org-nav-item${item.id === selectedId ? ' active' : ''}`}
      onClick={() => setSelectedId(item.id)}
    >
      <span className="org-nav-item-name">{item.name}</span>
      <span className="org-nav-item-meta">
        {stewardshipKindLabel(item.kind)} · {item.healthLabel}
      </span>
    </button>
  )

  const showGroupDescriptions = activeFilter === null
  const showServicesGroup = filteredServices.length > 0
  const showApplicationsGroup = filteredApplications.length > 0

  return (
    <div className="settings-shell stewardship-shell">
      <aside className="settings-nav" aria-label="Services and applications">
        <div className="settings-nav-header">
          <h2>Services & Applications</h2>
          <p>{PAGE_META.services.description}</p>
        </div>
        {activeFilter ? (
          <div className="stewardship-filter-bar">
            <span className="stewardship-filter-label">
              Filtered by: {STEWARDSHIP_FILTER_LABELS[activeFilter]}
            </span>
            <button type="button" className="stewardship-filter-clear" onClick={clearFilter}>
              Clear filter
            </button>
          </div>
        ) : null}
        <nav className="settings-nav-list stewardship-nav-list">
          {filteredItems.length === 0 ? (
            <p className="stewardship-nav-empty">No matching services or applications.</p>
          ) : (
            <>
              {showServicesGroup ? (
                <div className="stewardship-nav-group">
                  <div className="stewardship-nav-group-label">Services</div>
                  {showGroupDescriptions ? (
                    <p className="stewardship-nav-group-desc">
                      Infrastructure and background systems
                    </p>
                  ) : null}
                  {filteredServices.map(renderNavItem)}
                </div>
              ) : null}
              {showServicesGroup && showApplicationsGroup ? (
                <div className="stewardship-nav-divider" role="separator" aria-hidden="true" />
              ) : null}
              {showApplicationsGroup ? (
                <div className="stewardship-nav-group">
                  <div className="stewardship-nav-group-label">Applications</div>
                  {showGroupDescriptions ? (
                    <p className="stewardship-nav-group-desc">
                      Human-used software and business tools
                    </p>
                  ) : null}
                  {filteredApplications.map(renderNavItem)}
                </div>
              ) : null}
            </>
          )}
        </nav>
      </aside>

      <div className="settings-content">
        <div className="settings-page-content">
          <div className="settings-content-header stewardship-content-header">
            {selected ? (
              <>
                <div>
                  <p className="stewardship-prototype-label">Prototype view · mock stewardship data</p>
                  <div className="stewardship-detail-eyebrow">
                    {stewardshipDetailTitle(selected.kind)}
                  </div>
                  <h2>{selected.name}</h2>
                  <p>
                    {stewardshipKindLabel(selected.kind)} · {selected.vendor} · {selected.criticality}
                  </p>
                </div>
                <div className="stewardship-header-actions">
                  <button
                    type="button"
                    className="settings-action-btn primary"
                    onClick={() => setBriefingOpen(true)}
                  >
                    Brief Me
                  </button>
                  <StatusBadge
                    label={selected.stewardshipStatus}
                    tone={stewardshipStatusTone(selected.stewardshipStatus)}
                  />
                </div>
              </>
            ) : (
              <div>
                <p className="stewardship-prototype-label">Prototype view · mock stewardship data</p>
                <h2>No selection</h2>
                <p>No matching services or applications.</p>
              </div>
            )}
          </div>

          <div className="stewardship-type-summary-grid" aria-label="Category summary">
            <StewardshipSummaryCard
              filterId="services"
              label="Services"
              active={activeFilter === 'services'}
              onSelect={selectFilter}
            >
              <div className="stewardship-type-summary-value">{STEWARDSHIP_TYPE_SUMMARY.services}</div>
            </StewardshipSummaryCard>
            <StewardshipSummaryCard
              filterId="applications"
              label="Applications"
              active={activeFilter === 'applications'}
              onSelect={selectFilter}
            >
              <div className="stewardship-type-summary-value">
                {STEWARDSHIP_TYPE_SUMMARY.applications}
              </div>
            </StewardshipSummaryCard>
          </div>

          <div className="audit-summary-grid stewardship-summary-grid" aria-label="Stewardship summary">
            <StewardshipSummaryCard
              filterId="healthy"
              label="Healthy"
              active={activeFilter === 'healthy'}
              onSelect={selectFilter}
            >
              <div className="audit-summary-value tone-information">{STEWARDSHIP_SUMMARY.healthy}</div>
            </StewardshipSummaryCard>
            <StewardshipSummaryCard
              filterId="require-attention"
              label="Require Attention"
              active={activeFilter === 'require-attention'}
              onSelect={selectFilter}
            >
              <div className="audit-summary-value tone-warning">
                {STEWARDSHIP_SUMMARY.requireAttention}
              </div>
            </StewardshipSummaryCard>
            <StewardshipSummaryCard
              filterId="critical"
              label="Critical"
              active={activeFilter === 'critical'}
              onSelect={selectFilter}
            >
              <div className="audit-summary-value tone-critical">{STEWARDSHIP_SUMMARY.critical}</div>
            </StewardshipSummaryCard>
            <StewardshipSummaryCard
              filterId="outdated"
              label="Outdated"
              active={activeFilter === 'outdated'}
              onSelect={selectFilter}
            >
              <div className="audit-summary-value">{STEWARDSHIP_SUMMARY.outdated}</div>
            </StewardshipSummaryCard>
            <StewardshipSummaryCard
              filterId="licenses-expiring"
              label="Licenses Expiring"
              active={activeFilter === 'licenses-expiring'}
              onSelect={selectFilter}
            >
              <div className="audit-summary-value tone-warning">
                {STEWARDSHIP_SUMMARY.licensesExpiring}
              </div>
            </StewardshipSummaryCard>
          </div>

          {selected ? (
          <div className="settings-sections">
            <SettingsSectionCard title="Overview" className="span-full">
              <div className="detail-grid">
                <OrgDetailRow label="Type" value={stewardshipKindLabel(selected.kind)} />
                <OrgDetailRow label="Vendor" value={selected.vendor} />
                <OrgDetailRow label="Criticality" value={selected.criticality} />
                <OrgDetailRow label="Stewardship Status" value={selected.stewardshipStatus} />
                <OrgDetailRow label="Installed On" value={selected.installedOn} />
                <OrgDetailRow
                  label={selected.kind === 'service' ? 'Technical Owner' : 'Business Owner'}
                  value={selected.businessOwner}
                />
              </div>
            </SettingsSectionCard>

            <SettingsSectionCard title="Version & Staleness">
              <div className="detail-grid">
                <OrgDetailRow label="Current Version" value={selected.currentVersion} />
                <OrgDetailRow label="Latest Known Version" value={selected.latestKnownVersion} />
                <OrgDetailRow label="Version Status" value={selected.versionStatus} />
                <OrgDetailRow label="Last Updated" value={selected.lastUpdated} />
                <OrgDetailRow label="Staleness Type" value={selected.stalenessType} />
                <OrgDetailRow label="Staleness Detail" value={selected.stalenessDetail} />
              </div>
            </SettingsSectionCard>

            <SettingsSectionCard title="Operational Health">
              <div className="detail-grid">
                <OrgDetailRow label="Running State" value={selected.runningState} />
                <OrgDetailRow label="Last Successful Check" value={selected.lastSuccessfulCheck} />
                <OrgDetailRow label="Last Failure" value={selected.lastFailure} />
                <OrgDetailRow label="Confidence" value={selected.confidence} />
              </div>
            </SettingsSectionCard>

            <SettingsSectionCard title="Licensing">
              <div className="detail-grid">
                <OrgDetailRow label="License Status" value={selected.licenseStatus} />
                <OrgDetailRow label="Renewal Date" value={selected.renewalDate} />
                <OrgDetailRow label="Monthly Cost" value={selected.monthlyCost} />
                <OrgDetailRow label="Seats Used" value={selected.seatsUsed} />
              </div>
            </SettingsSectionCard>

            <SettingsSectionCard title="Relationships" className="span-full">
              <div className="detail-grid">
                <OrgDetailRow label="Depends On" value={selected.dependsOn.join(', ') || 'None'} />
                <OrgDetailRow
                  label="Protects / Supports"
                  value={selected.protectsSupports.join(', ')}
                />
                <OrgDetailRow label="Related Assets" value={selected.relatedAssets.join(', ')} />
                <OrgDetailRow
                  label="Related Recommendations"
                  value={selected.relatedRecommendations.join(', ') || 'None'}
                />
              </div>
            </SettingsSectionCard>

            <SettingsSectionCard title="Stuart Recommendation" className="span-full">
              <div className="detail-grid">
                <OrgDetailRow label="Observation" value={selected.observation} />
                <OrgDetailRow label="Reason" value={selected.reason} />
                <OrgDetailRow label="Recommended Action" value={selected.recommendedAction} />
                <OrgDetailRow label="Priority" value={selected.priority} />
              </div>
            </SettingsSectionCard>
          </div>
          ) : (
            <div className="stewardship-detail-empty">
              <p>No matching services or applications.</p>
              {activeFilter ? (
                <button type="button" className="stewardship-filter-clear" onClick={clearFilter}>
                  Clear filter
                </button>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {briefingOpen && selected ? (
        <StuartBriefingPanel item={selected} onClose={closeBriefing} />
      ) : null}
    </div>
  )
}

function OperationsConsole() {
  const [cpuRange, setCpuRange] = useState<TimeRangeId>('1m')
  const [memoryRange, setMemoryRange] = useState<TimeRangeId>('1m')
  const [gpuRange, setGpuRange] = useState<TimeRangeId>('1m')
  const [diskRange, setDiskRange] = useState<TimeRangeId>('1m')
  const [lastObservationAt, setLastObservationAt] = useState(
    () => new Date(Date.now() - 12_000),
  )
  const [relativeNow, setRelativeNow] = useState(() => new Date())
  const cpuSeries = useMetricTelemetry('cpu', cpuRange)
  const memorySeries = useMetricTelemetry('memory', memoryRange)
  const gpuSeries = useMetricTelemetry('gpu', gpuRange)
  const diskSeries = useMetricTelemetry('disk', diskRange)
  const [taskFeed, setTaskFeed] = useState<FeedEvent[]>(() =>
    seedFeed(STUART_TASK_TEMPLATES, 5, renderTaskDetail),
  )
  const taskCounter = useRef(STUART_TASK_TEMPLATES.length)

  const currentCpu = cpuSeries[cpuSeries.length - 1] ?? METRIC_BASELINES.cpu.base
  const currentMemory = memorySeries[memorySeries.length - 1] ?? METRIC_BASELINES.memory.base
  const currentGpu = gpuSeries[gpuSeries.length - 1] ?? METRIC_BASELINES.gpu.base
  const currentDisk = diskSeries[diskSeries.length - 1] ?? METRIC_BASELINES.disk.base

  useEffect(() => {
    const refreshObservation = window.setInterval(() => {
      setLastObservationAt(new Date())
    }, 12_000)
    const tickNow = window.setInterval(() => {
      setRelativeNow(new Date())
    }, 1000)
    return () => {
      window.clearInterval(refreshObservation)
      window.clearInterval(tickNow)
    }
  }, [])

  const pushTask = useCallback(() => {
    const template = STUART_TASK_TEMPLATES[taskCounter.current % STUART_TASK_TEMPLATES.length]
    taskCounter.current += 1
    const event: FeedEvent = {
      ...template,
      id: `task-${taskCounter.current}-${Date.now()}`,
      time: formatClock(new Date()),
      detail: renderTaskDetail(template.detail),
    }
    setTaskFeed((prev) => [event, ...prev].slice(0, 14))
  }, [])

  useEffect(() => {
    const scheduleNext = () => {
      const delay = 3000 + Math.random() * 5000
      return window.setTimeout(() => {
        pushTask()
        timerId = scheduleNext()
      }, delay)
    }
    let timerId = scheduleNext()
    return () => window.clearTimeout(timerId)
  }, [pushTask])

  const attentionServices = STUART_SERVICES.filter((s) => s.tone === 'warn').length
  const attentionProviders = STUART_PROVIDERS.filter((p) => p.tone === 'warn').length
  const summaryText =
    attentionServices > 0
      ? attentionServices === 1
        ? 'One Stuart service needs attention.'
        : `${attentionServices} Stuart services need attention.`
      : attentionProviders > 0
        ? 'Master Stuart is running normally. One connected system needs attention.'
        : 'Master Stuart is running normally.'

  const summaryTone: 'ok' | 'warn' | 'error' = attentionServices > 0 ? 'warn' : 'ok'

  const cpuTone: 'ok' | 'warn' | 'error' =
    currentCpu > 88 ? 'error' : currentCpu > 75 ? 'warn' : 'ok'
  const memTone: 'ok' | 'warn' | 'error' =
    currentMemory > 85 ? 'error' : currentMemory > 70 ? 'warn' : 'ok'
  const gpuTone: 'ok' | 'warn' | 'error' =
    currentGpu > 88 ? 'error' : currentGpu > 70 ? 'warn' : 'ok'
  const diskTone: 'ok' | 'warn' | 'error' =
    currentDisk > 85 ? 'error' : currentDisk > 65 ? 'warn' : 'ok'

  const opsPrompts = [
    'Is Stuart healthy?',
    'What is Stuart doing right now?',
    'Which service needs attention?',
    'Show provider problems',
  ]

  return (
    <div className="ops-console">
      <header className="stuart-summary-header panel-clickable">
        <div className="stuart-summary-main">
          <div className={`stuart-summary-text tone-${summaryTone}`}>{summaryText}</div>
          <div className="stuart-summary-sub">
            Observation engine is active · all core services responding
          </div>
        </div>
        <div className="ops-live-header-stats">
          <div className="ops-live-stat">
            <span className="ops-live-stat-label">Runtime</span>
            <span className="ops-runtime-pill">
              <span className="ops-runtime-dot" />
              Active
            </span>
          </div>
          <TelemetryFreshnessStat
            lastObservationAt={lastObservationAt}
            relativeNow={relativeNow}
          />
          <div className="ops-live-stat">
            <span className="ops-live-stat-label">Telemetry</span>
            <span className="ops-stream-indicator">
              <span className="ops-stream-dot" />
              Live machine telemetry
            </span>
          </div>
        </div>
      </header>

      <div className="ops-graphs">
        <OpsTelemetryPanel
          title="CPU Usage"
          subtitle="Stuart host · all cores"
          metric="cpu"
          unit="%"
          values={cpuSeries}
          color="#5794f2"
          status={cpuTone === 'ok' ? 'Normal' : cpuTone === 'warn' ? 'Elevated' : 'High'}
          statusTone={cpuTone}
          timeRange={cpuRange}
          onTimeRangeChange={setCpuRange}
        />
        <OpsTelemetryPanel
          title="Memory Usage"
          subtitle="Stuart process + runtime"
          metric="memory"
          unit="%"
          values={memorySeries}
          color="#73bf69"
          status={memTone === 'ok' ? 'Normal' : memTone === 'warn' ? 'Elevated' : 'High'}
          statusTone={memTone}
          timeRange={memoryRange}
          onTimeRangeChange={setMemoryRange}
        />
        <OpsTelemetryPanel
          title="GPU Usage"
          subtitle="Inference accelerator"
          metric="gpu"
          unit="%"
          values={gpuSeries}
          color="#b877d9"
          status={gpuTone === 'ok' ? 'Idle' : gpuTone === 'warn' ? 'Busy' : 'Saturated'}
          statusTone={gpuTone}
          timeRange={gpuRange}
          onTimeRangeChange={setGpuRange}
        />
        <OpsTelemetryPanel
          title="Disk Activity"
          subtitle="Read + write throughput"
          metric="disk"
          unit="%"
          values={diskSeries}
          color="#33b5e5"
          status={diskTone === 'ok' ? 'Normal' : diskTone === 'warn' ? 'Busy' : 'Heavy'}
          statusTone={diskTone}
          timeRange={diskRange}
          onTimeRangeChange={setDiskRange}
        />
      </div>

      <ConnectedSystemsOverview />

      <div className="ops-main">
        <LiveFeedPanel
          title="Active Tasks"
          subtitle="What Stuart is doing right now"
          events={taskFeed}
        />

        <AskStuartPanel context="operations" variant="embedded" prompts={opsPrompts} />
      </div>
    </div>
  )
}

function NetworkConsole() {
  const [wanLatency, setWanLatency] = useState(() => Array.from({ length: GRAPH_POINTS }, () => 18))
  const [packetLoss, setPacketLoss] = useState(() => Array.from({ length: GRAPH_POINTS }, () => 0))
  const [devicesOnline, setDevicesOnline] = useState(() =>
    Array.from({ length: GRAPH_POINTS }, () => 45),
  )
  const [gatewayCpu, setGatewayCpu] = useState(() =>
    Array.from({ length: GRAPH_POINTS }, () => 14),
  )
  const [currentLatency, setCurrentLatency] = useState(18)
  const [currentLoss, setCurrentLoss] = useState(0)
  const [currentOnline, setCurrentOnline] = useState(45)
  const [currentGatewayCpu, setCurrentGatewayCpu] = useState(14)
  const [activityFeed, setActivityFeed] = useState<FeedEvent[]>(() =>
    seedFeed(NETWORK_ACTIVITY_TEMPLATES, 5, (d) => renderNetworkDetail(d, 18, 0)),
  )
  const eventCounter = useRef(NETWORK_ACTIVITY_TEMPLATES.length)
  const latencyRef = useRef(18)
  const lossRef = useRef(0)

  const pushActivity = useCallback((latency: number, loss: number) => {
    const template = NETWORK_ACTIVITY_TEMPLATES[eventCounter.current % NETWORK_ACTIVITY_TEMPLATES.length]
    eventCounter.current += 1
    const event: FeedEvent = {
      ...template,
      id: `net-${eventCounter.current}-${Date.now()}`,
      time: formatClock(new Date()),
      detail: renderNetworkDetail(template.detail, latency, loss),
    }
    setActivityFeed((prev) => [event, ...prev].slice(0, 14))
  }, [])

  useEffect(() => {
    const tick = window.setInterval(() => {
      setCurrentLatency((prev) => {
        let next = prev + (Math.random() - 0.5) * 6
        if (Math.random() < 0.04) next += 40 + Math.random() * 60
        next = clamp(next, 9, 160)
        setWanLatency((series) => pushSeries(series, next))
        latencyRef.current = next
        return next
      })

      setCurrentLoss((prev) => {
        let next = prev + (Math.random() - 0.55) * 0.4
        if (Math.random() < 0.03) next += Math.random() * 2.5
        next = clamp(next, 0, 4.5)
        if (next < 0.05) next = 0
        setPacketLoss((series) => pushSeries(series, next))
        lossRef.current = next
        return next
      })

      setCurrentOnline((prev) => {
        let next = prev + (Math.random() < 0.08 ? (Math.random() < 0.5 ? -1 : 1) : 0)
        next = clamp(next, 43, 47)
        setDevicesOnline((series) => pushSeries(series, next))
        return next
      })

      setCurrentGatewayCpu((prev) => {
        let next = prev + (Math.random() - 0.5) * 4
        next = clamp(next, 8, 55)
        setGatewayCpu((series) => pushSeries(series, next))
        return next
      })
    }, 1000)

    return () => window.clearInterval(tick)
  }, [])

  useEffect(() => {
    const scheduleNext = () => {
      const delay = 3500 + Math.random() * 4500
      return window.setTimeout(() => {
        pushActivity(latencyRef.current, lossRef.current)
        timerId = scheduleNext()
      }, delay)
    }
    let timerId = scheduleNext()
    return () => window.clearTimeout(timerId)
  }, [pushActivity])

  const offlineCount = 47 - currentOnline
  const apOnline = 4
  const overallTone: 'ok' | 'warn' | 'error' =
    offlineCount >= 3 || currentLoss > 2 ? 'error' : offlineCount >= 1 || currentLatency > 80 ? 'warn' : 'ok'
  const overallLabel =
    overallTone === 'ok' ? 'Network healthy' : overallTone === 'warn' ? 'Attention required' : 'Critical signals'

  const latencyTone: 'ok' | 'warn' | 'error' =
    currentLatency > 80 ? 'error' : currentLatency > 35 ? 'warn' : 'ok'
  const lossTone: 'ok' | 'warn' | 'error' =
    currentLoss > 1.5 ? 'error' : currentLoss > 0.3 ? 'warn' : 'ok'
  const deviceTone: 'ok' | 'warn' | 'error' =
    offlineCount >= 2 ? 'error' : offlineCount >= 1 ? 'warn' : 'ok'
  const gatewayTone: 'ok' | 'warn' | 'error' =
    currentGatewayCpu > 60 ? 'error' : currentGatewayCpu > 45 ? 'warn' : 'ok'

  const networkPrompts = [
    'What needs my attention?',
    'Why is internet slow?',
    'What changed overnight?',
    'Show offline devices',
  ]

  return (
    <div className="ops-console">
      <header className="ops-live-header panel-clickable">
        <div className="ops-live-header-main">
          <div className="ops-live-title">Signal Lab Network</div>
          <div className="ops-live-subtitle">{PAGE_META.network.description}</div>
        </div>
        <div className="ops-live-header-stats">
          <div className="ops-live-stat">
            <span className="ops-live-stat-label">Overall</span>
            <StatusBadge label={overallLabel} tone={overallTone} />
          </div>
          <div className="ops-live-stat">
            <span className="ops-live-stat-label">Monitoring</span>
            <span className="ops-runtime-pill">
              <span className="ops-runtime-dot" />
              Active
            </span>
          </div>
          <div className="ops-live-stat">
            <span className="ops-live-stat-label">Telemetry</span>
            <span className="ops-stream-indicator">
              <span className="ops-stream-dot" />
              Streaming network telemetry
            </span>
          </div>
        </div>
      </header>

      <div className="ops-graphs">
        <LiveGraphPanel
          title="Internet / WAN"
          subtitle="Comcast · latency probe"
          value={currentLatency.toFixed(0)}
          unit="ms"
          values={wanLatency}
          color="#33b5e5"
          status={latencyTone === 'ok' ? 'Stable' : latencyTone === 'warn' ? 'Elevated' : 'Spike'}
          statusTone={latencyTone}
        />
        <LiveGraphPanel
          title="Packet Loss"
          subtitle="WAN edge · 60s window"
          value={currentLoss < 0.05 ? '0.0' : currentLoss.toFixed(1)}
          unit="%"
          values={packetLoss}
          color="#5794f2"
          status={lossTone === 'ok' ? 'Clear' : lossTone === 'warn' ? 'Minor' : 'Degraded'}
          statusTone={lossTone}
        />
        <LiveGraphPanel
          title="Devices Online"
          subtitle="Network clients and endpoints"
          value={`${currentOnline}`}
          unit="/ 47"
          values={devicesOnline}
          color="#73bf69"
          status={deviceTone === 'ok' ? 'Healthy' : `${offlineCount} offline`}
          statusTone={deviceTone}
        />
        <LiveGraphPanel
          title="Gateway"
          subtitle="UDM-SE · CPU load"
          value={currentGatewayCpu.toFixed(0)}
          unit="%"
          values={gatewayCpu}
          color="#b877d9"
          status={gatewayTone === 'ok' ? 'Normal' : gatewayTone === 'warn' ? 'Elevated' : 'High'}
          statusTone={gatewayTone}
        />
      </div>

      <div className="ops-status-strip">
        <StatusTile
          label="Internet"
          value="Online"
          detail={`${currentLatency.toFixed(0)} ms · loss ${currentLoss < 0.05 ? '0' : currentLoss.toFixed(1)}%`}
          tone={latencyTone}
        />
        <StatusTile label="Gateway" value="Online" detail="UDM-SE · firmware 4.0.6 · 18d uptime" tone="ok" />
        <StatusTile
          label="Access Points"
          value={`${apOnline} / 5`}
          detail="AP-Lounge offline · 4 responding"
          tone="warn"
        />
        <StatusTile label="Switches" value="2 / 2" detail="USW-Pro-24 · USW-Flex · all ports up" tone="ok" />
        <StatusTile
          label="Offline Devices"
          value={String(offlineCount)}
          detail={offlineCount > 0 ? 'AP-Lounge · Printer-HR' : 'None on network'}
          tone={deviceTone}
        />
        <StatusTile label="WAN Link" value="940 / 35" detail="Mbps down/up · link up 18 days" tone="ok" />
      </div>

      <div className="ops-main">
        <LiveFeedPanel
          title="Network Activity Feed"
          subtitle="Live network events · auto-updating sample stream"
          events={activityFeed}
        />

        <AskStuartPanel context="network" variant="embedded" prompts={networkPrompts} />
      </div>
    </div>
  )
}

function AssetExplorer() {
  const [selectedId, setSelectedId] = useState(ASSETS[0].id)
  const selected = ASSETS.find((a) => a.id === selectedId) ?? ASSETS[0]

  return (
    <>
      <div className="page-intro">
        <h2>Asset investigation</h2>
        <p>{PAGE_META.assets.description}</p>
      </div>
      <div className="split-layout">
        <div className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">Assets</div>
              <div className="panel-subtitle">Observed and registered</div>
            </div>
            <StatusBadge label={`${ASSETS.length} shown`} tone="info" />
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Type</th>
                <th>Status</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {ASSETS.map((asset) => (
                <tr
                  key={asset.id}
                  className={`asset-row ${asset.id === selectedId ? 'selected' : ''}`}
                  onClick={() => setSelectedId(asset.id)}
                >
                  <td>{asset.name}</td>
                  <td>{asset.type}</td>
                  <td>
                    <StatusBadge label={asset.status} tone={asset.statusClass} />
                  </td>
                  <td>{asset.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">{selected.name}</div>
              <div className="panel-subtitle">{selected.type} · {selected.match}</div>
            </div>
            <StatusBadge label={selected.status} tone={selected.statusClass} />
          </div>
          <div className="detail-grid">
            <div className="detail-row">
              <div className="detail-label">IP address</div>
              <div className="detail-value">{selected.ip}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Last seen</div>
              <div className="detail-value">{selected.lastSeen}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Match status</div>
              <div className="detail-value">{selected.match}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Summary</div>
              <div className="detail-value">{selected.detail}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

type OrganizationStatus = 'Active' | 'Pilot' | 'Prospect'

type Organization = {
  id: string
  name: string
  type: string
  status: OrganizationStatus
  primaryContact: string
  stuartCore: string
  renewal: string
  relationshipHealth: number
  lastCheckIn: string
  contacts: {
    primary: string
    technical: string
    billing: string
    emergency: string
  }
  subscription: {
    plan: string
    billingStatus: string
    anniversaryDate: string
    renewalDate: string
    monthlyFee: string
  }
  infrastructure: {
    stuartCoreVersion: string
    assets: string
    networks: string
    providers: string
    lastObservation: string
  }
  support: {
    openAlerts: string
    openRecommendations: string
    lastOperatorReview: string
    notes: string
  }
}

/*
 * Organizations are the Master Stuart business object.
 * Each organization may have zero, one, or many Stuart Core environments.
 * The Environment Selector chooses the active Stuart Core context.
 * This workspace manages the business relationship around those environments.
 */
const INITIAL_ORGANIZATIONS: Organization[] = [
  {
    id: 'signal-lab',
    name: 'Signal Lab',
    type: 'Internal Lab',
    status: 'Active',
    primaryContact: 'Michael',
    stuartCore: MOCK_CORE_VERSION_PLACEHOLDER,
    renewal: 'Not applicable',
    relationshipHealth: 100,
    lastCheckIn: '2 minutes ago',
    contacts: {
      primary: 'Michael',
      technical: 'Michael',
      billing: 'Michael',
      emergency: 'Michael',
    },
    subscription: {
      plan: 'Internal',
      billingStatus: 'Not billed',
      anniversaryDate: '2024-01-15',
      renewalDate: 'Not applicable',
      monthlyFee: '$0',
    },
    infrastructure: {
      stuartCoreVersion: MOCK_CORE_VERSION_PLACEHOLDER,
      assets: '142 observed',
      networks: '3 managed',
      providers: '9 configured',
      lastObservation: '30 seconds ago',
    },
    support: {
      openAlerts: '0',
      openRecommendations: '1',
      lastOperatorReview: 'Today · 07:10',
      notes: 'Primary development and validation environment for Master Stuart.',
    },
  },
  {
    id: 'oppure',
    name: 'Oppure',
    type: 'Business',
    status: 'Active',
    primaryContact: 'Michael',
    stuartCore: MOCK_CORE_VERSION_PLACEHOLDER,
    renewal: 'Pending',
    relationshipHealth: 92,
    lastCheckIn: '8 minutes ago',
    contacts: {
      primary: 'Michael',
      technical: 'Michael',
      billing: 'Michael',
      emergency: 'Michael',
    },
    subscription: {
      plan: 'Business Steward',
      billingStatus: 'Current',
      anniversaryDate: '2025-03-01',
      renewalDate: 'Pending review',
      monthlyFee: '$149',
    },
    infrastructure: {
      stuartCoreVersion: MOCK_CORE_VERSION_PLACEHOLDER,
      assets: '68 observed',
      networks: '2 managed',
      providers: '7 configured',
      lastObservation: '4 minutes ago',
    },
    support: {
      openAlerts: '1',
      openRecommendations: '2',
      lastOperatorReview: 'Yesterday · 16:40',
      notes: 'Renewal discussion scheduled for next quarter.',
    },
  },
  {
    id: 'maine',
    name: 'Maine',
    type: 'Personal Site',
    status: 'Active',
    primaryContact: 'Michael',
    stuartCore: MOCK_CORE_VERSION_PLACEHOLDER,
    renewal: 'Not applicable',
    relationshipHealth: 98,
    lastCheckIn: '5 minutes ago',
    contacts: {
      primary: 'Michael',
      technical: 'Michael',
      billing: 'Michael',
      emergency: 'Michael',
    },
    subscription: {
      plan: 'Personal Steward',
      billingStatus: 'Complimentary',
      anniversaryDate: '2025-06-01',
      renewalDate: 'Not applicable',
      monthlyFee: '$0',
    },
    infrastructure: {
      stuartCoreVersion: MOCK_CORE_VERSION_PLACEHOLDER,
      assets: '34 observed',
      networks: '1 managed',
      providers: '5 configured',
      lastObservation: '2 minutes ago',
    },
    support: {
      openAlerts: '0',
      openRecommendations: '0',
      lastOperatorReview: 'Mon 02 Jun · 09:15',
      notes: 'Low-touch personal environment with stable provider coverage.',
    },
  },
  {
    id: 'john',
    name: 'John',
    type: 'Pilot Operator',
    status: 'Pilot',
    primaryContact: 'John',
    stuartCore: 'Not installed',
    renewal: 'Not applicable',
    relationshipHealth: 85,
    lastCheckIn: '3 days ago',
    contacts: {
      primary: 'John',
      technical: 'John',
      billing: 'Michael',
      emergency: 'John',
    },
    subscription: {
      plan: 'Pilot',
      billingStatus: 'Evaluation',
      anniversaryDate: '2026-04-12',
      renewalDate: 'Not applicable',
      monthlyFee: '$0',
    },
    infrastructure: {
      stuartCoreVersion: 'Not installed',
      assets: 'Not observed',
      networks: 'Not connected',
      providers: 'Not configured',
      lastObservation: 'No recent observation',
    },
    support: {
      openAlerts: '0',
      openRecommendations: '3',
      lastOperatorReview: 'Fri 30 May · 14:20',
      notes: 'Pilot onboarding in progress. Stuart Core installation pending.',
    },
  },
  {
    id: 'abc-manufacturing',
    name: 'ABC Manufacturing',
    type: 'Customer',
    status: 'Prospect',
    primaryContact: 'Jane Smith',
    stuartCore: MOCK_CORE_VERSION_PLACEHOLDER,
    renewal: '2027-06-08',
    relationshipHealth: 72,
    lastCheckIn: '1 hour ago',
    contacts: {
      primary: 'Jane Smith',
      technical: 'David Chen',
      billing: 'Accounts Payable',
      emergency: 'Jane Smith',
    },
    subscription: {
      plan: 'Enterprise Steward',
      billingStatus: 'Proposal sent',
      anniversaryDate: 'Not started',
      renewalDate: '2027-06-08',
      monthlyFee: '$499',
    },
    infrastructure: {
      stuartCoreVersion: MOCK_CORE_VERSION_PLACEHOLDER,
      assets: '210 observed',
      networks: '4 managed',
      providers: '11 configured',
      lastObservation: '18 minutes ago',
    },
    support: {
      openAlerts: '2',
      openRecommendations: '4',
      lastOperatorReview: 'Thu 05 Jun · 11:05',
      notes: 'Prospect evaluation environment. Follow up on backup provider gaps.',
    },
  },
]

function relationshipHealthTone(health: number): 'ok' | 'warn' | 'error' {
  if (health >= 95) return 'ok'
  if (health >= 80) return 'warn'
  return 'error'
}

function cloneOrganization(org: Organization): Organization {
  return structuredClone(org)
}

function OrgDetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="detail-row">
      <div className="detail-label">{label}</div>
      <div className="detail-value">{value}</div>
    </div>
  )
}

function OrgEditRow({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="org-edit-row">
      <label className="org-edit-label">{label}</label>
      <div className="org-edit-control">{children}</div>
    </div>
  )
}

const ORGANIZATION_STATUS_OPTIONS: OrganizationStatus[] = ['Active', 'Pilot', 'Prospect']

function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>(INITIAL_ORGANIZATIONS)
  const [selectedId, setSelectedId] = useState(INITIAL_ORGANIZATIONS[0].id)
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState<Organization | null>(null)

  const selected = organizations.find((org) => org.id === selectedId) ?? organizations[0]
  const display = isEditing && draft ? draft : selected
  const healthTone = relationshipHealthTone(display.relationshipHealth)

  const handleSelectOrganization = (id: string) => {
    setIsEditing(false)
    setDraft(null)
    setSelectedId(id)
  }

  const handleEdit = () => {
    setDraft(cloneOrganization(selected))
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setDraft(null)
  }

  const handleSave = () => {
    if (!draft) return
    const saved: Organization = {
      ...draft,
      primaryContact: draft.contacts.primary,
      renewal: draft.subscription.renewalDate,
      relationshipHealth: Math.min(100, Math.max(0, draft.relationshipHealth)),
    }
    setOrganizations((current) =>
      current.map((org) => (org.id === saved.id ? saved : org)),
    )
    setIsEditing(false)
    setDraft(null)
  }

  const updateDraft = (patch: Partial<Organization>) => {
    setDraft((current) => (current ? { ...current, ...patch } : current))
  }

  return (
    <div className="settings-shell organizations-shell">
      <aside className="settings-nav" aria-label="Organizations">
        <div className="settings-nav-header">
          <h2>Organizations</h2>
          <p>{PAGE_META.organizations.description}</p>
        </div>
        <nav className="settings-nav-list">
          {organizations.map((org) => (
            <button
              key={org.id}
              type="button"
              className={`settings-nav-item org-nav-item${org.id === selectedId ? ' active' : ''}`}
              onClick={() => handleSelectOrganization(org.id)}
            >
              <span className="org-nav-item-name">{org.name}</span>
              <span className="org-nav-item-meta">
                {org.type} · {org.status}
              </span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="settings-content">
        <div className="settings-page-content">
          <div className="settings-content-header org-content-header">
            <div className="org-content-header-main">
              <div>
                <h2>{display.name}</h2>
                <p>
                  {display.type} · {display.status}
                </p>
              </div>
              <div className="org-relationship-health-stat" aria-label="Relationship Health">
                <span className="org-health-stat-label">Relationship Health</span>
                <span className={`org-health-stat-value tone-${healthTone}`}>
                  {display.relationshipHealth}%
                </span>
              </div>
            </div>
            <div className="org-content-header-toolbar">
              {isEditing ? (
                <p className="org-edit-helper">
                  Prototype only — changes are stored in this browser session.
                </p>
              ) : null}
              <div className="org-content-actions">
                {isEditing ? (
                  <>
                    <button type="button" className="settings-action-btn primary" onClick={handleSave}>
                      Save
                    </button>
                    <button type="button" className="settings-action-btn" onClick={handleCancel}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button type="button" className="settings-action-btn" onClick={handleEdit}>
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="settings-sections">
            <SettingsSectionCard title="Overview" className="span-full">
              {isEditing && draft ? (
                <div className="org-edit-grid">
                  <OrgEditRow label="Organization name">
                    <input
                      className="setting-input org-edit-input"
                      type="text"
                      value={draft.name}
                      onChange={(e) => updateDraft({ name: e.target.value })}
                    />
                  </OrgEditRow>
                  <OrgEditRow label="Type">
                    <input
                      className="setting-input org-edit-input"
                      type="text"
                      value={draft.type}
                      onChange={(e) => updateDraft({ type: e.target.value })}
                    />
                  </OrgEditRow>
                  <OrgEditRow label="Status">
                    <select
                      className="setting-select org-edit-input"
                      value={draft.status}
                      onChange={(e) =>
                        updateDraft({ status: e.target.value as OrganizationStatus })
                      }
                    >
                      {ORGANIZATION_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </OrgEditRow>
                  <OrgEditRow label="Relationship Health">
                    <input
                      className="setting-input org-edit-input"
                      type="number"
                      min={0}
                      max={100}
                      value={draft.relationshipHealth}
                      onChange={(e) =>
                        updateDraft({ relationshipHealth: Number(e.target.value) || 0 })
                      }
                    />
                  </OrgEditRow>
                  <OrgEditRow label="Current Stuart Core">
                    <input
                      className="setting-input org-edit-input"
                      type="text"
                      value={draft.stuartCore}
                      onChange={(e) => updateDraft({ stuartCore: e.target.value })}
                    />
                  </OrgEditRow>
                  <OrgEditRow label="Last Check-In">
                    <input
                      className="setting-input org-edit-input"
                      type="text"
                      value={draft.lastCheckIn}
                      onChange={(e) => updateDraft({ lastCheckIn: e.target.value })}
                    />
                  </OrgEditRow>
                </div>
              ) : (
                <div className="detail-grid">
                  <OrgDetailRow label="Organization" value={selected.name} />
                  <OrgDetailRow label="Type" value={selected.type} />
                  <OrgDetailRow label="Status" value={selected.status} />
                  <OrgDetailRow
                    label="Relationship Health"
                    value={
                      <span className={`org-health-value tone-${healthTone}`}>
                        {selected.relationshipHealth}%
                      </span>
                    }
                  />
                  <OrgDetailRow label="Current Stuart Core" value={selected.stuartCore} />
                  <OrgDetailRow label="Last Check-In" value={selected.lastCheckIn} />
                </div>
              )}
            </SettingsSectionCard>

            <SettingsSectionCard title="Contacts">
              {isEditing && draft ? (
                <div className="org-edit-grid">
                  <OrgEditRow label="Primary Contact">
                    <input
                      className="setting-input org-edit-input"
                      type="text"
                      value={draft.contacts.primary}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          contacts: { ...draft.contacts, primary: e.target.value },
                        })
                      }
                    />
                  </OrgEditRow>
                  <OrgEditRow label="Technical Contact">
                    <input
                      className="setting-input org-edit-input"
                      type="text"
                      value={draft.contacts.technical}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          contacts: { ...draft.contacts, technical: e.target.value },
                        })
                      }
                    />
                  </OrgEditRow>
                  <OrgEditRow label="Billing Contact">
                    <input
                      className="setting-input org-edit-input"
                      type="text"
                      value={draft.contacts.billing}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          contacts: { ...draft.contacts, billing: e.target.value },
                        })
                      }
                    />
                  </OrgEditRow>
                  <OrgEditRow label="Emergency Contact">
                    <input
                      className="setting-input org-edit-input"
                      type="text"
                      value={draft.contacts.emergency}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          contacts: { ...draft.contacts, emergency: e.target.value },
                        })
                      }
                    />
                  </OrgEditRow>
                </div>
              ) : (
                <div className="detail-grid">
                  <OrgDetailRow label="Primary Contact" value={selected.contacts.primary} />
                  <OrgDetailRow label="Technical Contact" value={selected.contacts.technical} />
                  <OrgDetailRow label="Billing Contact" value={selected.contacts.billing} />
                  <OrgDetailRow label="Emergency Contact" value={selected.contacts.emergency} />
                </div>
              )}
            </SettingsSectionCard>

            <SettingsSectionCard title="Subscription">
              {isEditing && draft ? (
                <div className="org-edit-grid">
                  <OrgEditRow label="Plan">
                    <input
                      className="setting-input org-edit-input"
                      type="text"
                      value={draft.subscription.plan}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          subscription: { ...draft.subscription, plan: e.target.value },
                        })
                      }
                    />
                  </OrgEditRow>
                  <OrgEditRow label="Billing Status">
                    <input
                      className="setting-input org-edit-input"
                      type="text"
                      value={draft.subscription.billingStatus}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          subscription: { ...draft.subscription, billingStatus: e.target.value },
                        })
                      }
                    />
                  </OrgEditRow>
                  <OrgEditRow label="Anniversary Date">
                    <input
                      className="setting-input org-edit-input"
                      type="text"
                      value={draft.subscription.anniversaryDate}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          subscription: { ...draft.subscription, anniversaryDate: e.target.value },
                        })
                      }
                    />
                  </OrgEditRow>
                  <OrgEditRow label="Renewal Date">
                    <input
                      className="setting-input org-edit-input"
                      type="text"
                      value={draft.subscription.renewalDate}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          subscription: { ...draft.subscription, renewalDate: e.target.value },
                        })
                      }
                    />
                  </OrgEditRow>
                  <OrgEditRow label="Monthly Fee">
                    <input
                      className="setting-input org-edit-input"
                      type="text"
                      value={draft.subscription.monthlyFee}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          subscription: { ...draft.subscription, monthlyFee: e.target.value },
                        })
                      }
                    />
                  </OrgEditRow>
                </div>
              ) : (
                <div className="detail-grid">
                  <OrgDetailRow label="Plan" value={selected.subscription.plan} />
                  <OrgDetailRow label="Billing Status" value={selected.subscription.billingStatus} />
                  <OrgDetailRow label="Anniversary Date" value={selected.subscription.anniversaryDate} />
                  <OrgDetailRow label="Renewal Date" value={selected.subscription.renewalDate} />
                  <OrgDetailRow label="Monthly Fee" value={selected.subscription.monthlyFee} />
                </div>
              )}
            </SettingsSectionCard>

            <SettingsSectionCard title="Infrastructure">
              {isEditing && draft ? (
                <div className="org-edit-grid">
                  <OrgEditRow label="Stuart Core Version">
                    <input
                      className="setting-input org-edit-input"
                      type="text"
                      value={draft.infrastructure.stuartCoreVersion}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          infrastructure: {
                            ...draft.infrastructure,
                            stuartCoreVersion: e.target.value,
                          },
                        })
                      }
                    />
                  </OrgEditRow>
                  <OrgEditRow label="Assets">
                    <input
                      className="setting-input org-edit-input"
                      type="text"
                      value={draft.infrastructure.assets}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          infrastructure: { ...draft.infrastructure, assets: e.target.value },
                        })
                      }
                    />
                  </OrgEditRow>
                  <OrgEditRow label="Networks">
                    <input
                      className="setting-input org-edit-input"
                      type="text"
                      value={draft.infrastructure.networks}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          infrastructure: { ...draft.infrastructure, networks: e.target.value },
                        })
                      }
                    />
                  </OrgEditRow>
                  <OrgEditRow label="Providers">
                    <input
                      className="setting-input org-edit-input"
                      type="text"
                      value={draft.infrastructure.providers}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          infrastructure: { ...draft.infrastructure, providers: e.target.value },
                        })
                      }
                    />
                  </OrgEditRow>
                  <OrgEditRow label="Last Observation">
                    <input
                      className="setting-input org-edit-input"
                      type="text"
                      value={draft.infrastructure.lastObservation}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          infrastructure: {
                            ...draft.infrastructure,
                            lastObservation: e.target.value,
                          },
                        })
                      }
                    />
                  </OrgEditRow>
                </div>
              ) : (
                <div className="detail-grid">
                  <OrgDetailRow
                    label="Stuart Core Version"
                    value={selected.infrastructure.stuartCoreVersion}
                  />
                  <OrgDetailRow label="Assets" value={selected.infrastructure.assets} />
                  <OrgDetailRow label="Networks" value={selected.infrastructure.networks} />
                  <OrgDetailRow label="Providers" value={selected.infrastructure.providers} />
                  <OrgDetailRow
                    label="Last Observation"
                    value={selected.infrastructure.lastObservation}
                  />
                </div>
              )}
            </SettingsSectionCard>

            <SettingsSectionCard title="Support" className="span-full">
              {isEditing && draft ? (
                <div className="org-edit-grid">
                  <OrgEditRow label="Open Alerts">
                    <input
                      className="setting-input org-edit-input"
                      type="text"
                      value={draft.support.openAlerts}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          support: { ...draft.support, openAlerts: e.target.value },
                        })
                      }
                    />
                  </OrgEditRow>
                  <OrgEditRow label="Open Recommendations">
                    <input
                      className="setting-input org-edit-input"
                      type="text"
                      value={draft.support.openRecommendations}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          support: { ...draft.support, openRecommendations: e.target.value },
                        })
                      }
                    />
                  </OrgEditRow>
                  <OrgEditRow label="Last Operator Review">
                    <input
                      className="setting-input org-edit-input"
                      type="text"
                      value={draft.support.lastOperatorReview}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          support: { ...draft.support, lastOperatorReview: e.target.value },
                        })
                      }
                    />
                  </OrgEditRow>
                  <OrgEditRow label="Notes">
                    <textarea
                      className="setting-input org-edit-textarea"
                      rows={3}
                      value={draft.support.notes}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          support: { ...draft.support, notes: e.target.value },
                        })
                      }
                    />
                  </OrgEditRow>
                </div>
              ) : (
                <div className="detail-grid">
                  <OrgDetailRow label="Open Alerts" value={selected.support.openAlerts} />
                  <OrgDetailRow
                    label="Open Recommendations"
                    value={selected.support.openRecommendations}
                  />
                  <OrgDetailRow
                    label="Last Operator Review"
                    value={selected.support.lastOperatorReview}
                  />
                  <OrgDetailRow label="Notes" value={selected.support.notes} />
                </div>
              )}
            </SettingsSectionCard>
          </div>
        </div>
      </div>
    </div>
  )
}

function AuditPage({ currentEnvironment }: { currentEnvironment: Environment }) {
  type AuditSeverity = 'information' | 'warning' | 'critical'
  type AuditCategory = 'SYSTEM' | 'NETWORK' | 'BACKUP' | 'SECURITY' | 'OPERATOR'

  type AuditEvent = {
    id: string
    time: string
    severity: AuditSeverity
    category: AuditCategory
    actor: string
    action: string
    detail: string
    observation: string
    reason: string
    confidence: string
    recommendedAction: string
    relatedEvents: string[]
    evidence: string[]
  }

  const events: AuditEvent[] = [
    {
      id: 'audit-001',
      time: '2026-06-08 06:42:11',
      severity: 'warning',
      category: 'NETWORK',
      actor: 'Stuart',
      action: 'Device state change',
      detail: 'AP-Lounge marked offline after UniFi observation',
      observation: 'UniFi reported AP-Lounge unavailable.',
      reason: 'Ping verification also failed.',
      confidence: '98%',
      recommendedAction: 'Verify AP power before replacing hardware.',
      relatedEvents: ['WAN anomaly at 02:15', 'UniFi poll at 06:41'],
      evidence: ['UniFi controller event log', 'ICMP probe failure', 'Last seen 06:40:52'],
    },
    {
      id: 'audit-002',
      time: '2026-06-08 05:10:44',
      severity: 'information',
      category: 'BACKUP',
      actor: 'Stuart',
      action: 'Backup observed',
      detail: 'Veeam job completed on TrueNAS-Core',
      observation: 'Veeam reported job completion for nightly backup.',
      reason: 'Job duration and restore point matched expected schedule.',
      confidence: '99%',
      recommendedAction: 'No action required. Continue monitoring tonight’s job.',
      relatedEvents: ['Backblaze sync at 04:55'],
      evidence: ['Veeam job summary', 'TrueNAS snapshot record'],
    },
    {
      id: 'audit-003',
      time: '2026-06-08 04:18:02',
      severity: 'information',
      category: 'OPERATOR',
      actor: 'hatzopoulos',
      action: 'Settings viewed',
      detail: 'Providers section opened',
      observation: 'Operator opened Providers settings in the Operations Assistant shell.',
      reason: 'Routine configuration review; no provider state changed.',
      confidence: '100%',
      recommendedAction: 'No action required.',
      relatedEvents: [],
      evidence: ['Session audit entry', 'UI navigation trace'],
    },
    {
      id: 'audit-004',
      time: '2026-06-08 02:15:33',
      severity: 'information',
      category: 'NETWORK',
      actor: 'Stuart',
      action: 'WAN anomaly',
      detail: 'Comcast latency exceeded threshold for 4 minutes',
      observation: 'WAN latency rose above the configured threshold.',
      reason: 'Upstream ISP path showed elevated round-trip time without packet loss.',
      confidence: '92%',
      recommendedAction: 'Monitor for recurrence before escalating to ISP.',
      relatedEvents: ['Gateway health check at 02:11'],
      evidence: ['UniFi gateway metrics', 'Latency sample window 02:11–02:15'],
    },
    {
      id: 'audit-005',
      time: '2026-06-07 23:01:19',
      severity: 'information',
      category: 'SECURITY',
      actor: 'hatzopoulos',
      action: 'Stewardship review',
      detail: 'Printer-HR reachability flagged for follow-up',
      observation: 'Printer-HR did not respond during scheduled reachability check.',
      reason: 'Device may be offline or on a VLAN without management access.',
      confidence: '85%',
      recommendedAction: 'Confirm printer power and network segment during next site visit.',
      relatedEvents: ['Asset inventory refresh at 22:45'],
      evidence: ['Reachability probe log', 'Asset record Printer-HR'],
    },
    ...MOCK_USER_AUDIT_EVENTS.map((entry) => ({
      id: entry.id,
      time: entry.time,
      severity: 'information' as const,
      category: 'SECURITY' as const,
      actor: entry.actor,
      action: entry.event,
      detail: entry.detail,
      observation: entry.detail,
      reason: 'Mock user-system audit entry for Experience Lab preview.',
      confidence: '100%',
      recommendedAction: 'No action required in preview mode.',
      relatedEvents: [] as string[],
      evidence: ['Mock session audit log'],
    })),
  ]

  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null)

  const environmentLine = `${currentEnvironment.name} • ${currentEnvironment.coreLabel} • ${currentEnvironment.coreVersion}`

  useEffect(() => {
    if (!selectedEvent) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedEvent(null)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedEvent])

  const severityLabel: Record<AuditSeverity, string> = {
    information: 'Information',
    warning: 'Warning',
    critical: 'Critical',
  }

  const severityTone: Record<AuditSeverity, 'info' | 'warn' | 'error'> = {
    information: 'info',
    warning: 'warn',
    critical: 'error',
  }

  return (
    <>
      <div className="page-intro">
        <h2>Audit History</h2>
        <p>{PAGE_META.audit.description}</p>
      </div>

      {/* Single-Core Mode: events scoped to currentEnvironment — no Environment column. */}
      {/* Master Stuart Mode (future): Environment column appears when viewing all Stuart Cores. */}
      <div className="panel audit-environment-context audit-environment-context-compact" aria-label="Audit environment context">
        <div className="audit-environment-context-label">Viewing Environment</div>
        <div className="audit-environment-context-line">{environmentLine}</div>
      </div>

      <div className="audit-summary-grid" aria-label="Audit summary">
        <div className="audit-summary-card">
          <div className="audit-summary-label">Events Today</div>
          <div className="audit-summary-value">5</div>
        </div>
        <div className="audit-summary-card">
          <div className="audit-summary-label">Critical</div>
          <div className="audit-summary-value tone-critical">0</div>
        </div>
        <div className="audit-summary-card">
          <div className="audit-summary-label">Warnings</div>
          <div className="audit-summary-value tone-warning">1</div>
        </div>
        <div className="audit-summary-card">
          <div className="audit-summary-label">Informational</div>
          <div className="audit-summary-value tone-information">4</div>
        </div>
      </div>

      <div className="filter-bar audit-filter-bar">
        <input className="filter-input" type="text" placeholder="Search events…" />
        <input className="filter-input" type="text" placeholder="Actor" />
        <input className="filter-input" type="text" placeholder="From date" />
        <input className="filter-input" type="text" placeholder="To date" />
        <select className="filter-input filter-select" defaultValue="" aria-label="Category filter">
          <option value="">Category</option>
          <option value="all">All categories</option>
          <option value="system">SYSTEM</option>
          <option value="network">NETWORK</option>
          <option value="backup">BACKUP</option>
          <option value="security">SECURITY</option>
          <option value="operator">OPERATOR</option>
        </select>
        <select className="filter-input filter-select" defaultValue="" aria-label="Severity filter">
          <option value="">Severity</option>
          <option value="all">All severities</option>
          <option value="information">Information</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">Event log</div>
            <div className="panel-subtitle">Most recent first · select a row to investigate</div>
          </div>
          <StatusBadge label={`${events.length} events`} tone="info" />
        </div>
        <table className="data-table audit-event-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Severity</th>
              <th>Category</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Detail</th>
              {/* Master Stuart Mode (future): <th>Environment</th> */}
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr
                key={event.id}
                className={`audit-event-row${selectedEvent?.id === event.id ? ' is-selected' : ''}`}
                onClick={() => setSelectedEvent(event)}
                tabIndex={0}
                role="button"
                aria-label={`Open details for ${event.action}`}
                onKeyDown={(keyboardEvent) => {
                  if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
                    keyboardEvent.preventDefault()
                    setSelectedEvent(event)
                  }
                }}
              >
                <td>{event.time}</td>
                <td>
                  <StatusBadge
                    label={severityLabel[event.severity]}
                    tone={severityTone[event.severity]}
                  />
                </td>
                <td>
                  <span className="audit-category">{event.category}</span>
                </td>
                <td>{event.actor}</td>
                <td>{event.action}</td>
                <td>{event.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedEvent ? (
        <>
          <button
            type="button"
            className="audit-drawer-overlay"
            aria-label="Close event details"
            onClick={() => setSelectedEvent(null)}
          />
          <aside className="audit-drawer" aria-label="Event details">
            <div className="audit-drawer-header">
              <div>
                <div className="audit-drawer-eyebrow">Event Details</div>
                <div className="audit-drawer-title">{selectedEvent.action}</div>
              </div>
              <button
                type="button"
                className="audit-drawer-close"
                aria-label="Close"
                onClick={() => setSelectedEvent(null)}
              >
                ×
              </button>
            </div>

            <div className="audit-drawer-body">
              <section className="audit-drawer-section">
                <h3 className="audit-drawer-section-title">Summary</h3>
                <dl className="audit-drawer-facts">
                  <div className="audit-drawer-fact">
                    <dt>Timestamp</dt>
                    <dd>{selectedEvent.time}</dd>
                  </div>
                  <div className="audit-drawer-fact">
                    <dt>Severity</dt>
                    <dd>
                      <StatusBadge
                        label={severityLabel[selectedEvent.severity]}
                        tone={severityTone[selectedEvent.severity]}
                      />
                    </dd>
                  </div>
                  <div className="audit-drawer-fact">
                    <dt>Category</dt>
                    <dd>
                      <span className="audit-category">{selectedEvent.category}</span>
                    </dd>
                  </div>
                  <div className="audit-drawer-fact">
                    <dt>Actor</dt>
                    <dd>{selectedEvent.actor}</dd>
                  </div>
                  <div className="audit-drawer-fact">
                    <dt>Action</dt>
                    <dd>{selectedEvent.action}</dd>
                  </div>
                </dl>
              </section>

              <section className="audit-drawer-section">
                <h3 className="audit-drawer-section-title">Stuart Reasoning</h3>
                <div className="audit-reasoning-block">
                  <div className="audit-reasoning-label">Observation</div>
                  <p>{selectedEvent.observation}</p>
                </div>
                <div className="audit-reasoning-block">
                  <div className="audit-reasoning-label">Reason</div>
                  <p>{selectedEvent.reason}</p>
                </div>
                <div className="audit-reasoning-block">
                  <div className="audit-reasoning-label">Confidence</div>
                  <p className="audit-confidence">{selectedEvent.confidence}</p>
                </div>
                <div className="audit-reasoning-block">
                  <div className="audit-reasoning-label">Recommended Action</div>
                  <p>{selectedEvent.recommendedAction}</p>
                </div>
              </section>

              <section className="audit-drawer-section">
                <h3 className="audit-drawer-section-title">Related Events</h3>
                {selectedEvent.relatedEvents.length > 0 ? (
                  <ul className="audit-drawer-list">
                    {selectedEvent.relatedEvents.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="audit-drawer-empty">No related events recorded.</p>
                )}
              </section>

              <section className="audit-drawer-section">
                <h3 className="audit-drawer-section-title">Evidence</h3>
                <ul className="audit-drawer-list">
                  {selectedEvent.evidence.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            </div>
          </aside>
        </>
      ) : null}
    </>
  )
}

function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSectionId>('communication')

  const activeCategory = SETTINGS_CATEGORIES.find((c) => c.id === activeSection)

  return (
    <div className="settings-shell">
      <aside className="settings-nav" aria-label="Settings categories">
        <div className="settings-nav-header">
          <h2>Settings</h2>
          <p>Configure Stuart</p>
        </div>
        <nav className="settings-nav-list">
          {SETTINGS_CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`settings-nav-item${activeSection === category.id ? ' active' : ''}`}
              onClick={() => setActiveSection(category.id as SettingsSectionId)}
            >
              {category.title}
            </button>
          ))}
        </nav>
      </aside>

      <div className="settings-content">
        {activeSection === 'communication' ? (
          <CommunicationSettings />
        ) : activeSection === 'users' ? (
          <UsersSettings />
        ) : activeSection === 'providers' ? (
          <ProvidersSettings />
        ) : activeSection === 'security' ? (
          <SecuritySettings />
        ) : (
          <SettingsPlaceholder title={activeCategory?.title ?? 'Settings'} />
        )}
      </div>
    </div>
  )
}

function SettingsPlaceholder({ title }: { title: string }) {
  return (
    <div className="settings-placeholder">
      <h2>{title}</h2>
      <p>Configuration page coming next.</p>
    </div>
  )
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: ReactNode
}) {
  return (
    <div className="setting-row">
      <div className="setting-row-label">
        <span className="setting-row-title">{label}</span>
        {description ? <span className="setting-row-desc">{description}</span> : null}
      </div>
      <div className="setting-row-control">{children}</div>
    </div>
  )
}

function SettingToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <SettingRow label={label} description={description}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`setting-switch${checked ? ' on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="setting-switch-thumb" />
      </button>
    </SettingRow>
  )
}

function SettingSlider({
  label,
  description,
  value,
  min,
  max,
  unit,
  onChange,
}: {
  label: string
  description?: string
  value: number
  min: number
  max: number
  unit?: string
  onChange: (value: number) => void
}) {
  return (
    <SettingRow label={label} description={description}>
      <div className="setting-slider-wrap">
        <input
          className="setting-slider"
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <span className="setting-slider-value">
          {value}
          {unit ?? ''}
        </span>
      </div>
    </SettingRow>
  )
}

function SettingSelect({
  label,
  description,
  value,
  options,
  onChange,
}: {
  label: string
  description?: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  return (
    <SettingRow label={label} description={description}>
      <select
        className="setting-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </SettingRow>
  )
}

function SettingSegmented({
  label,
  description,
  value,
  options,
  onChange,
}: {
  label: string
  description?: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  return (
    <SettingRow label={label} description={description}>
      <div className="setting-segmented" role="group" aria-label={label}>
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`setting-segment${value === opt.value ? ' active' : ''}`}
            aria-pressed={value === opt.value}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </SettingRow>
  )
}

function SettingsSectionCard({
  title,
  subtitle,
  children,
  className = '',
}: {
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`settings-section-card ${className}`.trim()}>
      <header className="settings-section-header">
        <h3>{title}</h3>
        {subtitle ? <p>{subtitle}</p> : null}
      </header>
      <div className="settings-section-body">{children}</div>
    </section>
  )
}

function CommunicationSettings() {
  const [profile, setProfile] = useState('operator')
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [voiceSelection, setVoiceSelection] = useState('stuart-default')
  const [speakingSpeed, setSpeakingSpeed] = useState(50)
  const [speakingVolume, setSpeakingVolume] = useState(72)
  const [wakeWord, setWakeWord] = useState('Stuart')
  const [pushToTalk, setPushToTalk] = useState(false)
  const [alwaysListening, setAlwaysListening] = useState(true)
  const [confirmBeforeSpeaking, setConfirmBeforeSpeaking] = useState(false)
  const [responseLength, setResponseLength] = useState('standard')
  const [showConfidence, setShowConfidence] = useState(true)
  const [explainReasoning, setExplainReasoning] = useState(true)
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false)
  const [askBeforeAction, setAskBeforeAction] = useState(true)
  const [plainLanguage, setPlainLanguage] = useState(true)
  const [notifyDesktop, setNotifyDesktop] = useState(true)
  const [notifyEmail, setNotifyEmail] = useState(true)
  const [notifyDiscord, setNotifyDiscord] = useState(false)
  const [notifyVoice, setNotifyVoice] = useState(true)
  const [criticalOnly, setCriticalOnly] = useState(false)
  const [quietHours, setQuietHours] = useState(true)
  const [quietStart, setQuietStart] = useState('22:00')
  const [quietEnd, setQuietEnd] = useState('07:00')
  const [theme, setTheme] = useState('dark')
  const [accentColor, setAccentColor] = useState('blue')
  const [compactMode, setCompactMode] = useState(false)
  const [graphDensity, setGraphDensity] = useState('standard')
  const [fontSize, setFontSize] = useState('medium')
  const [largeText, setLargeText] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const [keyboardNav, setKeyboardNav] = useState(true)
  const [screenReader, setScreenReader] = useState(false)
  const [colorBlindPalette, setColorBlindPalette] = useState(false)

  const currentProfile = COMMUNICATION_PROFILES.find((p) => p.id === profile)

  return (
    <div className="settings-page-content">
      <header className="settings-content-header">
        <h2>Communication</h2>
        <p>Explanation level, voice, listening, notifications, and conversation behavior.</p>
      </header>

      <div className="settings-sections">
        <SettingsSectionCard title="Communication Profile" className="span-full">
          <div className="profile-current">
            <span className="profile-current-label">Current Profile</span>
            <StatusBadge label={currentProfile?.title ?? 'Operator'} tone="info" />
          </div>
          <div className="profile-grid">
            {COMMUNICATION_PROFILES.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`profile-card${profile === item.id ? ' active' : ''}`}
                onClick={() => setProfile(item.id)}
              >
                <span className="profile-card-title">{item.title}</span>
                <span className="profile-card-desc">{item.description}</span>
              </button>
            ))}
          </div>
        </SettingsSectionCard>

        <SettingsSectionCard title="Voice" subtitle="Speech output and listening behavior">
          <SettingToggle label="Voice Enabled" description="Allow Stuart to speak responses aloud." checked={voiceEnabled} onChange={setVoiceEnabled} />
          <SettingSelect
            label="Voice Selection"
            description="Choose the voice Stuart uses for spoken output."
            value={voiceSelection}
            onChange={setVoiceSelection}
            options={[
              { value: 'stuart-default', label: 'Stuart Default' },
              { value: 'natural-male', label: 'Natural Male' },
              { value: 'natural-female', label: 'Natural Female' },
              { value: 'compact', label: 'Compact Operator' },
            ]}
          />
          <SettingSlider label="Speaking Speed" value={speakingSpeed} min={25} max={100} unit="%" onChange={setSpeakingSpeed} />
          <SettingSlider label="Speaking Volume" value={speakingVolume} min={0} max={100} unit="%" onChange={setSpeakingVolume} />
          <SettingRow label="Wake Word" description="Phrase that activates listening mode.">
            <input className="setting-input" type="text" value={wakeWord} onChange={(e) => setWakeWord(e.target.value)} />
          </SettingRow>
          <SettingToggle label="Push-to-Talk" description="Require a key press before Stuart listens." checked={pushToTalk} onChange={setPushToTalk} />
          <SettingToggle label="Always Listening" description="Keep the microphone ready in trusted environments." checked={alwaysListening} onChange={setAlwaysListening} />
          <SettingToggle label="Confirmation Before Speaking" description="Ask before reading responses aloud." checked={confirmBeforeSpeaking} onChange={setConfirmBeforeSpeaking} />
        </SettingsSectionCard>

        <SettingsSectionCard title="Conversation" subtitle="How Stuart writes and explains responses">
          <SettingSegmented
            label="Response Length"
            description="Default verbosity for answers and summaries."
            value={responseLength}
            onChange={setResponseLength}
            options={[
              { value: 'brief', label: 'Brief' },
              { value: 'standard', label: 'Standard' },
              { value: 'detailed', label: 'Detailed' },
            ]}
          />
          <SettingToggle label="Show Confidence" description="Display how certain Stuart is about an answer." checked={showConfidence} onChange={setShowConfidence} />
          <SettingToggle label="Explain Reasoning" description="Include why Stuart reached a conclusion." checked={explainReasoning} onChange={setExplainReasoning} />
          <SettingToggle label="Show Technical Details" description="Surface IDs, paths, and engine names when helpful." checked={showTechnicalDetails} onChange={setShowTechnicalDetails} />
          <SettingToggle label="Ask Before Taking Action" description="Confirm before Stuart performs a steward action." checked={askBeforeAction} onChange={setAskBeforeAction} />
          <SettingToggle label="Use Plain Language" description="Prefer operator-friendly wording over internal terms." checked={plainLanguage} onChange={setPlainLanguage} />
        </SettingsSectionCard>

        <SettingsSectionCard title="Notifications" subtitle="Where and when Stuart alerts you">
          <SettingToggle label="Desktop" description="Show in-app toast and banner alerts." checked={notifyDesktop} onChange={setNotifyDesktop} />
          <SettingToggle label="Email" description="Send summary and attention emails." checked={notifyEmail} onChange={setNotifyEmail} />
          <SettingToggle label="Discord" description="Post alerts to a configured Discord channel." checked={notifyDiscord} onChange={setNotifyDiscord} />
          <SettingToggle label="Voice" description="Speak critical notifications aloud." checked={notifyVoice} onChange={setNotifyVoice} />
          <SettingToggle label="Critical Alerts Only" description="Suppress non-urgent notifications." checked={criticalOnly} onChange={setCriticalOnly} />
          <SettingToggle label="Quiet Hours" description="Reduce notifications during scheduled hours." checked={quietHours} onChange={setQuietHours} />
          {quietHours ? (
            <SettingRow label="Quiet Hours Schedule" description="Notifications are softened during this window.">
              <div className="setting-time-range">
                <input className="setting-input setting-time" type="time" value={quietStart} onChange={(e) => setQuietStart(e.target.value)} />
                <span className="setting-time-sep">to</span>
                <input className="setting-input setting-time" type="time" value={quietEnd} onChange={(e) => setQuietEnd(e.target.value)} />
              </div>
            </SettingRow>
          ) : null}
        </SettingsSectionCard>

        <SettingsSectionCard title="Appearance" subtitle="Visual presentation across Stuart">
          <SettingSelect
            label="Theme"
            value={theme}
            onChange={setTheme}
            options={[
              { value: 'dark', label: 'Dark' },
              { value: 'light', label: 'Light' },
              { value: 'system', label: 'Match System' },
            ]}
          />
          <SettingSelect
            label="Accent Color"
            value={accentColor}
            onChange={setAccentColor}
            options={[
              { value: 'blue', label: 'Operations Blue' },
              { value: 'cyan', label: 'Telemetry Cyan' },
              { value: 'green', label: 'Healthy Green' },
              { value: 'amber', label: 'Attention Amber' },
            ]}
          />
          <SettingToggle label="Compact Mode" description="Tighter spacing for dense displays." checked={compactMode} onChange={setCompactMode} />
          <SettingSelect
            label="Graph Density"
            value={graphDensity}
            onChange={setGraphDensity}
            options={[
              { value: 'comfortable', label: 'Comfortable' },
              { value: 'standard', label: 'Standard' },
              { value: 'dense', label: 'Dense' },
            ]}
          />
          <SettingSelect
            label="Font Size"
            value={fontSize}
            onChange={setFontSize}
            options={[
              { value: 'small', label: 'Small' },
              { value: 'medium', label: 'Medium' },
              { value: 'large', label: 'Large' },
            ]}
          />
        </SettingsSectionCard>

        <SettingsSectionCard title="Accessibility" subtitle="Readability and interaction support">
          <SettingToggle label="Large Text" description="Increase base text size across the application." checked={largeText} onChange={setLargeText} />
          <SettingToggle label="High Contrast" description="Strengthen text and border contrast." checked={highContrast} onChange={setHighContrast} />
          <SettingToggle label="Keyboard Navigation" description="Highlight focus and improve tab order." checked={keyboardNav} onChange={setKeyboardNav} />
          <SettingToggle label="Screen Reader Support" description="Enrich labels for assistive technologies." checked={screenReader} onChange={setScreenReader} />
          <SettingToggle label="Color-Blind Friendly Palette" description="Use status colors safe for common color-vision deficiency." checked={colorBlindPalette} onChange={setColorBlindPalette} />
        </SettingsSectionCard>
      </div>
    </div>
  )
}

const USER_SESSIONS = [
  {
    user: 'Michael',
    device: 'MSI Workstation',
    location: 'Signal Lab',
    loginTime: '07:12',
    duration: '2h 14m',
    status: 'Active',
    tone: 'ok' as const,
  },
  {
    user: 'John',
    device: 'XPS Laptop',
    location: 'Remote',
    loginTime: 'Yesterday',
    duration: '—',
    status: 'Offline',
    tone: 'info' as const,
  },
  {
    user: 'Matthew',
    device: 'COMMS-01',
    location: 'Signal Lab',
    loginTime: '09:44',
    duration: 'Active',
    status: 'Active',
    tone: 'ok' as const,
  },
]

function userAccountStatusTone(
  status: (typeof MOCK_STUART_USERS)[number]['accountStatus'],
): 'ok' | 'warn' | 'info' {
  if (status === 'Active') return 'ok'
  if (status === 'Invited') return 'info'
  return 'warn'
}

function UsersSettings() {
  const { currentUser, session, signOut } = useAuth()
  const [windowsLogin, setWindowsLogin] = useState(true)
  const [mfa, setMfa] = useState(true)
  const [localAccounts, setLocalAccounts] = useState(false)
  const [passwordExpiration, setPasswordExpiration] = useState(true)
  const [sessionTimeout, setSessionTimeout] = useState('8h')
  const [autoLogout, setAutoLogout] = useState(true)
  const [approveLearning, setApproveLearning] = useState(true)
  const [approveAutomation, setApproveAutomation] = useState(true)
  const [approveNotifications, setApproveNotifications] = useState(false)
  const [approveProviders, setApproveProviders] = useState(true)
  const [approveAssets, setApproveAssets] = useState(true)

  return (
    <div className="settings-page-content">
      <header className="settings-content-header">
        <h2>Users</h2>
        <p>Stuart user accounts, roles, permissions, and active sessions.</p>
      </header>

      <div className="settings-sections">
        <SettingsSectionCard title="Active User" subtitle="Who is controlling Stuart right now" className="span-full">
          <div className="active-user-panel">
            <div className="active-user-label">Current User</div>
            <div className="active-user-name">{currentUser.displayName}</div>
            <div className="active-user-grid">
              <div className="active-user-field">
                <span className="active-user-field-label">Role</span>
                <span className="active-user-field-value">{currentUser.role}</span>
              </div>
              <div className="active-user-field">
                <span className="active-user-field-label">Status</span>
                <span className="active-user-field-value online">
                  <span className="user-account-status-dot" />
                  {currentUser.accountStatus}
                </span>
              </div>
              <div className="active-user-field">
                <span className="active-user-field-label">Current Session</span>
                <span className="active-user-field-value">{session.durationLabel}</span>
              </div>
              <div className="active-user-field">
                <span className="active-user-field-label">Machine</span>
                <span className="active-user-field-value">{session.device}</span>
              </div>
              <div className="active-user-field">
                <span className="active-user-field-label">Location</span>
                <span className="active-user-field-value">{session.location}</span>
              </div>
            </div>
            <div className="settings-action-bar active-user-actions">
              <button type="button" className="settings-action-btn" onClick={signOut}>
                Sign Out
              </button>
            </div>
          </div>
        </SettingsSectionCard>

        <SettingsSectionCard title="Users" subtitle="People who can sign in to Stuart" className="span-full">
          <table className="data-table settings-sessions-table users-directory-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>MFA</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_STUART_USERS.map((user) => (
                <tr key={user.id}>
                  <td>{user.displayName}</td>
                  <td>{user.role}</td>
                  <td>
                    {user.mfaStatus === 'Enabled'
                      ? 'MFA Enabled'
                      : user.mfaStatus === 'Pending'
                        ? 'MFA Pending'
                        : 'MFA Disabled'}
                  </td>
                  <td>
                    <StatusBadge
                      label={user.accountStatus}
                      tone={userAccountStatusTone(user.accountStatus)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SettingsSectionCard>

        <SettingsSectionCard title="Roles" subtitle="Intended permissions for each Stuart role" className="span-full">
          <div className="roles-grid">
            {MOCK_STUART_ROLES.map((role) => (
              <div key={role.title} className="role-card">
                <div className="role-card-title">{role.title}</div>
                <div className="role-card-desc">{role.description}</div>
                <ul className="role-permissions">
                  {role.permissions.map((permission) => (
                    <li key={permission}>{permission}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </SettingsSectionCard>

        <SettingsSectionCard title="Active Sessions" subtitle="Where users are signed in now" className="span-full">
          <table className="data-table settings-sessions-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Device</th>
                <th>Location</th>
                <th>Login Time</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {USER_SESSIONS.map((session) => (
                <tr key={`${session.user}-${session.device}`}>
                  <td>{session.user}</td>
                  <td>{session.device}</td>
                  <td>{session.location}</td>
                  <td>{session.loginTime}</td>
                  <td>{session.duration}</td>
                  <td>
                    <StatusBadge label={session.status} tone={session.tone} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SettingsSectionCard>

        <SettingsSectionCard title="Authentication" subtitle="How users sign in and stay secure">
          <SettingToggle label="Windows Login Integration" description="Use Windows credentials for Stuart sign-in." checked={windowsLogin} onChange={setWindowsLogin} />
          <SettingToggle label="Multi-Factor Authentication" description="Require a second factor for privileged roles." checked={mfa} onChange={setMfa} />
          <SettingToggle label="Local Accounts" description="Allow Stuart-managed username and password accounts." checked={localAccounts} onChange={setLocalAccounts} />
          <SettingToggle label="Password Expiration" description="Require periodic password rotation for local accounts." checked={passwordExpiration} onChange={setPasswordExpiration} />
          <SettingSelect
            label="Session Timeout"
            description="Automatically end idle sessions after this period."
            value={sessionTimeout}
            onChange={setSessionTimeout}
            options={[
              { value: '1h', label: '1 hour' },
              { value: '4h', label: '4 hours' },
              { value: '8h', label: '8 hours' },
              { value: '24h', label: '24 hours' },
            ]}
          />
          <SettingToggle label="Auto Logout" description="Sign out when the workstation locks or sleeps." checked={autoLogout} onChange={setAutoLogout} />
        </SettingsSectionCard>

        <SettingsSectionCard title="Steward Approval" subtitle="Actions that require operator confirmation">
          <SettingToggle label="Learning" description="Approve before Stuart updates learned patterns." checked={approveLearning} onChange={setApproveLearning} />
          <SettingToggle label="Automation" description="Approve before new or changed automation rules run." checked={approveAutomation} onChange={setApproveAutomation} />
          <SettingToggle label="Notifications" description="Approve before outbound steward notifications send." checked={approveNotifications} onChange={setApproveNotifications} />
          <SettingToggle label="Provider Changes" description="Approve before connecting or changing external systems." checked={approveProviders} onChange={setApproveProviders} />
          <SettingToggle label="Asset Registration" description="Approve before registering or merging new assets." checked={approveAssets} onChange={setApproveAssets} />
        </SettingsSectionCard>
      </div>
    </div>
  )
}

const CONFIGURED_PROVIDERS = [
  {
    id: 'unifi',
    name: 'UniFi',
    icon: 'U',
    purpose: 'Network monitoring',
    status: 'Connected',
    tone: 'ok' as const,
    polling: 'Every 60 seconds',
    lastCheck: '12 seconds ago',
    connection: 'HTTPS API',
    enabled: true,
  },
  {
    id: 'truenas',
    name: 'TrueNAS',
    icon: 'T',
    purpose: 'Storage monitoring',
    status: 'Connected',
    tone: 'ok' as const,
    polling: '5 minutes',
    lastCheck: '2 minutes ago',
    connection: 'HTTPS API',
    enabled: true,
  },
  {
    id: 'veeam',
    name: 'Veeam',
    icon: 'V',
    purpose: 'Backup monitoring',
    status: 'Connected',
    tone: 'ok' as const,
    polling: '10 minutes',
    lastCheck: '4 minutes ago',
    connection: 'REST API',
    enabled: true,
  },
  {
    id: 'backblaze',
    name: 'Backblaze',
    icon: 'B',
    purpose: 'Cloud backup',
    status: 'Connected',
    tone: 'ok' as const,
    polling: '15 minutes',
    lastCheck: '6 minutes ago',
    connection: 'HTTPS API',
    enabled: true,
  },
  {
    id: 'outlook',
    name: 'Outlook',
    icon: 'O',
    purpose: 'Email',
    status: 'Attention',
    tone: 'warn' as const,
    polling: 'Every minute',
    lastCheck: '22 minutes ago',
    connection: 'Microsoft Graph',
    attentionReason: 'Authentication expires soon',
    enabled: true,
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: 'G',
    purpose: 'Repository monitoring',
    status: 'Connected',
    tone: 'ok' as const,
    polling: '10 minutes',
    lastCheck: '12 minutes ago',
    connection: 'HTTPS API',
    enabled: true,
  },
  {
    id: 'openai',
    name: 'OpenAI',
    icon: 'AI',
    purpose: 'Language intelligence',
    status: 'Connected',
    tone: 'ok' as const,
    polling: 'On demand',
    lastCheck: '8 seconds ago',
    connection: 'HTTPS API',
    enabled: true,
  },
  {
    id: 'weather',
    name: 'Weather',
    icon: 'W',
    purpose: 'Environmental context',
    status: 'Connected',
    tone: 'ok' as const,
    polling: 'Every hour',
    lastCheck: '38 minutes ago',
    connection: 'HTTPS API',
    enabled: true,
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: 'D',
    purpose: 'Notifications',
    status: 'Disabled',
    tone: 'info' as const,
    polling: '5 minutes',
    lastCheck: '3 minutes ago',
    connection: 'Webhook',
    enabled: false,
  },
]

const PROVIDER_HEALTH = [
  { provider: 'UniFi', availability: '100%', responseTime: '72 ms', lastError: 'None', confidence: '99%', tone: 'ok' as const },
  { provider: 'TrueNAS', availability: '100%', responseTime: '118 ms', lastError: 'None', confidence: '98%', tone: 'ok' as const },
  { provider: 'Veeam', availability: '100%', responseTime: '156 ms', lastError: 'None', confidence: '96%', tone: 'ok' as const },
  { provider: 'Backblaze', availability: '99%', responseTime: '190 ms', lastError: 'None', confidence: '95%', tone: 'ok' as const },
  { provider: 'Outlook', availability: '94%', responseTime: '480 ms', lastError: 'Authentication warning', confidence: '82%', tone: 'warn' as const },
  { provider: 'GitHub', availability: '99%', responseTime: '210 ms', lastError: 'None', confidence: '97%', tone: 'ok' as const },
  { provider: 'OpenAI', availability: '100%', responseTime: '340 ms', lastError: 'None', confidence: '100%', tone: 'ok' as const },
  { provider: 'Weather', availability: '100%', responseTime: '95 ms', lastError: 'None', confidence: '94%', tone: 'ok' as const },
]

const POLLING_INTERVAL_OPTIONS = [
  { value: '30s', label: 'Every 30 seconds' },
  { value: '60s', label: 'Every 60 seconds' },
  { value: '1m', label: 'Every minute' },
  { value: '5m', label: 'Every 5 minutes' },
  { value: '10m', label: 'Every 10 minutes' },
  { value: '15m', label: 'Every 15 minutes' },
  { value: '1h', label: 'Every hour' },
]

const POLLING_SCHEDULE = [
  {
    id: 'unifi',
    provider: 'UniFi',
    interval: '60s',
    lastPoll: '12 seconds ago',
    observation: 'No network changes',
    observationTone: 'neutral' as const,
    observationTooltip: 'Gateway, switches, and access points match the last known good state.',
    nextPoll: '48 seconds',
  },
  {
    id: 'truenas',
    provider: 'TrueNAS',
    interval: '5m',
    lastPoll: '2 minutes ago',
    observation: 'Pool healthy',
    observationTone: 'ok' as const,
    observationTooltip: 'signal-lab pool is online with no new storage warnings.',
    nextPoll: '3 minutes',
  },
  {
    id: 'veeam',
    provider: 'Veeam',
    interval: '10m',
    lastPoll: '4 minutes ago',
    observation: 'Backup completed',
    observationTone: 'ok' as const,
    observationTooltip: 'The most recent on-site backup job finished successfully overnight.',
    nextPoll: '6 minutes',
  },
  {
    id: 'backblaze',
    provider: 'Backblaze',
    interval: '15m',
    lastPoll: '6 minutes ago',
    observation: 'Cloud sync current',
    observationTone: 'ok' as const,
    observationTooltip: 'Off-site backup sync completed with no missing files reported.',
    nextPoll: '9 minutes',
  },
  {
    id: 'outlook',
    provider: 'Outlook',
    interval: '1m',
    lastPoll: '58 seconds ago',
    observation: '2 new emails',
    observationTone: 'warn' as const,
    observationTooltip: 'Outlook detected two unread messages. Authentication refresh is also needed soon.',
    nextPoll: '2 seconds',
  },
  {
    id: 'github',
    provider: 'GitHub',
    interval: '10m',
    lastPoll: '12 minutes ago',
    observation: 'No repository activity',
    observationTone: 'neutral' as const,
    observationTooltip: 'No new commits, pull requests, or deployment signals since the last check.',
    nextPoll: 'in 8 min',
  },
  {
    id: 'openai',
    provider: 'OpenAI',
    interval: '30s',
    lastPoll: '8 seconds ago',
    observation: 'Idle',
    observationTone: 'neutral' as const,
    observationTooltip: 'No language requests were made during the most recent check.',
    nextPoll: 'On demand',
  },
  {
    id: 'weather',
    provider: 'Weather',
    interval: '1h',
    lastPoll: '38 minutes ago',
    observation: '74°F • Clear',
    observationTone: 'ok' as const,
    observationTooltip: 'Current conditions at Signal Lab are clear with light wind.',
    nextPoll: '22 minutes',
  },
  {
    id: 'discord',
    provider: 'Discord',
    interval: '5m',
    lastPoll: 'Paused',
    observation: 'No notifications',
    observationTone: 'neutral' as const,
    observationTooltip: 'Discord is disabled, so Stuart is not checking for new messages.',
    nextPoll: '—',
  },
]

const AVAILABLE_PROVIDERS = [
  { category: 'Network', items: ['Cisco', 'pfSense'] },
  { category: 'Storage', items: ['Synology'] },
  { category: 'Communication', items: ['Gmail', 'Slack'] },
  { category: 'Cloud', items: ['Azure', 'AWS'] },
  { category: 'AI', items: ['Local Models'] },
]

function ObservationCell({
  text,
  tone,
  tooltip,
}: {
  text: string
  tone: 'ok' | 'warn' | 'error' | 'neutral'
  tooltip: string
}) {
  return (
    <span className={`polling-observation tone-${tone}`}>
      {text}
      <span className="polling-observation-tooltip" role="tooltip">
        {tooltip}
      </span>
    </span>
  )
}

function ConfiguredProviderCard({
  name,
  icon,
  purpose,
  status,
  tone,
  polling,
  lastCheck,
  connection,
  attentionReason,
  enabled,
  onToggle,
}: {
  name: string
  icon: string
  purpose: string
  status: string
  tone: 'ok' | 'warn' | 'error' | 'info'
  polling: string
  lastCheck: string
  connection: string
  attentionReason?: string
  enabled: boolean
  onToggle: (enabled: boolean) => void
}) {
  return (
    <div className={`configured-provider-card${enabled ? '' : ' is-disabled'}`}>
      <div className="provider-catalog-header">
        <div className="provider-catalog-identity">
          <span className="provider-icon" aria-hidden="true">{icon}</span>
          <div>
            <div className="provider-catalog-name">{name}</div>
            <div className="provider-catalog-purpose">{purpose}</div>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={`${enabled ? 'Disable' : 'Enable'} ${name}`}
          className={`setting-switch${enabled ? ' on' : ''}`}
          onClick={() => onToggle(!enabled)}
        />
      </div>
      <div className="provider-catalog-details">
        <div className="provider-catalog-detail">
          <span className="provider-catalog-label">Status</span>
          <StatusBadge label={status} tone={tone} />
        </div>
        <div className="provider-catalog-detail">
          <span className="provider-catalog-label">Polling</span>
          <span>{polling}</span>
        </div>
        <div className="provider-catalog-detail">
          <span className="provider-catalog-label">Last Check</span>
          <span>{lastCheck}</span>
        </div>
        <div className="provider-catalog-detail">
          <span className="provider-catalog-label">Connection</span>
          <span>{connection}</span>
        </div>
        {attentionReason ? (
          <div className="provider-catalog-attention">{attentionReason}</div>
        ) : null}
      </div>
    </div>
  )
}

function ProvidersSettings() {
  const [providerEnabled, setProviderEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(CONFIGURED_PROVIDERS.map((p) => [p.id, p.enabled])),
  )
  const [pollIntervals, setPollIntervals] = useState<Record<string, string>>(() =>
    Object.fromEntries(POLLING_SCHEDULE.map((p) => [p.id, p.interval])),
  )

  const configuredCount = CONFIGURED_PROVIDERS.length
  const activeCount = CONFIGURED_PROVIDERS.filter((p) => providerEnabled[p.id]).length
  const healthyCount = CONFIGURED_PROVIDERS.filter(
    (p) => providerEnabled[p.id] && p.tone === 'ok',
  ).length
  const attentionCount = CONFIGURED_PROVIDERS.filter(
    (p) => providerEnabled[p.id] && p.tone === 'warn',
  ).length
  const disabledConfiguredCount = CONFIGURED_PROVIDERS.filter((p) => !providerEnabled[p.id]).length

  return (
    <div className="settings-page-content">
      <header className="settings-content-header">
        <h2>Providers</h2>
        <p>Where Stuart gets information from — configured connections and supported provider types.</p>
      </header>

      <div className="settings-sections">
        <SettingsSectionCard title="Provider Overview" subtitle="Configured providers Stuart is actively using" className="span-full">
          <div className="provider-overview-grid">
            <div className="provider-overview-stat">
              <span className="provider-overview-label">Configured Providers</span>
              <span className="provider-overview-value">{configuredCount}</span>
            </div>
            <div className="provider-overview-stat">
              <span className="provider-overview-label">Healthy Providers</span>
              <span className="provider-overview-value tone-ok">{healthyCount}</span>
            </div>
            <div className="provider-overview-stat">
              <span className="provider-overview-label">Attention Required</span>
              <span className="provider-overview-value tone-warn">{attentionCount}</span>
            </div>
            <div className="provider-overview-stat">
              <span className="provider-overview-label">Disabled Configured</span>
              <span className="provider-overview-value">{disabledConfiguredCount}</span>
            </div>
            <div className="provider-overview-stat">
              <span className="provider-overview-label">Last Provider Check</span>
              <span className="provider-overview-value mono">14 seconds ago</span>
            </div>
            <div className="provider-overview-stat">
              <span className="provider-overview-label">Active Connections</span>
              <span className="provider-overview-value">{activeCount}</span>
            </div>
          </div>
        </SettingsSectionCard>

        <SettingsSectionCard title="Configured Providers" subtitle="Providers Stuart is actively using right now" className="span-full">
          <div className="configured-providers-grid">
            {CONFIGURED_PROVIDERS.map((provider) => (
              <ConfiguredProviderCard
                key={provider.id}
                {...provider}
                enabled={providerEnabled[provider.id]}
                onToggle={(enabled) =>
                  setProviderEnabled((prev) => ({ ...prev, [provider.id]: enabled }))
                }
              />
            ))}
          </div>
        </SettingsSectionCard>

        <SettingsSectionCard title="Provider Health" subtitle="Availability for configured providers only" className="span-full">
          <table className="data-table settings-sessions-table">
            <thead>
              <tr>
                <th>Provider</th>
                <th>Availability</th>
                <th>Response Time</th>
                <th>Last Error</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {PROVIDER_HEALTH.map((row) => (
                <tr key={row.provider}>
                  <td>{row.provider}</td>
                  <td>{row.availability}</td>
                  <td>{row.responseTime}</td>
                  <td className={row.tone === 'warn' ? 'provider-health-warn' : ''}>{row.lastError}</td>
                  <td>{row.confidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SettingsSectionCard>

        <SettingsSectionCard
          title="Polling Schedule"
          subtitle="When Stuart checked each provider and what it learned"
          className="span-full"
        >
          <table className="data-table settings-sessions-table polling-schedule-table">
            <thead>
              <tr>
                <th>Provider</th>
                <th>Interval</th>
                <th>Last Poll</th>
                <th>Last Observation</th>
                <th>Next Poll</th>
              </tr>
            </thead>
            <tbody>
              {POLLING_SCHEDULE.map((row) => (
                <tr key={row.id}>
                  <td>{row.provider}</td>
                  <td>
                    <select
                      className="setting-select setting-select-inline"
                      value={pollIntervals[row.id]}
                      onChange={(e) =>
                        setPollIntervals((prev) => ({ ...prev, [row.id]: e.target.value }))
                      }
                    >
                      {POLLING_INTERVAL_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="polling-last-poll">{row.lastPoll}</td>
                  <td>
                    <ObservationCell
                      text={row.observation}
                      tone={row.observationTone}
                      tooltip={row.observationTooltip}
                    />
                  </td>
                  <td>{row.nextPoll}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SettingsSectionCard>

        <SettingsSectionCard title="Provider Actions" subtitle="Common maintenance actions" className="span-full">
          <div className="settings-action-bar">
            <button type="button" className="settings-action-btn primary">Test Connection</button>
            <button type="button" className="settings-action-btn">Reconnect Provider</button>
            <button type="button" className="settings-action-btn">Refresh All Providers</button>
            <button type="button" className="settings-action-btn">View Provider Logs</button>
            <button type="button" className="settings-action-btn">Disable Provider</button>
            <button type="button" className="settings-action-btn">Add Provider</button>
          </div>
        </SettingsSectionCard>

        <SettingsSectionCard title="Available Providers" subtitle="Provider types Stuart supports but has not configured yet" className="span-full available-providers-section">
          <div className="available-providers-grid">
            {AVAILABLE_PROVIDERS.map((group) => (
              <div key={group.category} className="available-providers-group">
                <div className="available-providers-category">{group.category}</div>
                <div className="available-providers-items">
                  {group.items.map((item) => (
                    <span key={item} className="available-provider-chip">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SettingsSectionCard>
      </div>
    </div>
  )
}

function PageContent({
  page,
  currentEnvironment,
  onNavigate,
}: {
  page: PageId
  currentEnvironment: Environment
  onNavigate: (page: PageId) => void
}) {
  switch (page) {
    case 'home':
      return <HomePage onNavigate={onNavigate} />
    case 'operations':
      return <OperationsConsole />
    case 'organizations':
      return <OrganizationsPage />
    case 'network':
      return <NetworkConsole />
    case 'services':
      return <ServicesApplicationsPage />
    case 'assets':
      return <AssetExplorer />
    case 'audit':
      return <AuditPage currentEnvironment={currentEnvironment} />
    case 'settings':
      return <SettingsPage />
    default:
      return <HomePage onNavigate={onNavigate} />
  }
}

function App() {
  const [activePage, setActivePage] = useState<PageId>('home')
  const [currentEnvironment, setCurrentEnvironment] = useState<Environment>(MOCK_ENVIRONMENTS[0])
  const [headerClock, setHeaderClock] = useState(() => new Date())
  const meta = PAGE_META[activePage]

  useEffect(() => {
    const tick = window.setInterval(() => setHeaderClock(new Date()), 1000)
    return () => window.clearInterval(tick)
  }, [])

  return (
    <SessionGate>
      <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-name">STUART</div>
          <div className="sidebar-brand-tag">{EXPERIENCE_LAB_VERSION_LABEL}</div>
        </div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-item${activePage === item.id ? ' active' : ''}`}
              onClick={() => setActivePage(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer" aria-label="Environment status">
          <div className="environment-status-panel">
            <div className="environment-status-primary">{ENVIRONMENT_STATUS_FOOTER.buildLabel}</div>
            <div className="environment-status-secondary">{ENVIRONMENT_STATUS_FOOTER.dataLabel}</div>
          </div>
        </div>
      </aside>

      <div className="main-column">
        <header className="top-header">
          <div className="header-left">
            <EnvironmentSelector
              currentEnvironment={currentEnvironment}
              availableEnvironments={MOCK_ENVIRONMENTS}
              onEnvironmentChange={setCurrentEnvironment}
            />
          </div>
          <div className="header-center">
            <div className="header-title">{meta.title}</div>
          </div>
          <div className="header-right">
            <HeaderOperator />
            <div className="status-pill">
              <span className="status-dot" />
              Core Connected
            </div>
            <HeaderClock now={headerClock} />
          </div>
        </header>

        <main className="page-body">
          <PageContent
            page={activePage}
            currentEnvironment={currentEnvironment}
            onNavigate={setActivePage}
          />
        </main>
      </div>
    </div>
    </SessionGate>
  )
}

export default App
