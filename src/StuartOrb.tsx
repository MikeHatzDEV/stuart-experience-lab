import stuartOrbArtwork from './assets/stuart-orb-v1.png'
import './StuartOrb.css'

/** Presence modes — monitoring and listening are active; speaking and alert reserved for future behavior. */
export type StuartOrbStatus = 'monitoring' | 'listening' | 'speaking' | 'alert'

const PRESENCE_STATUS: Record<StuartOrbStatus, { primary: string; secondary: string }> = {
  monitoring: {
    primary: 'Monitoring',
    secondary: 'Continuous Observation Active',
  },
  listening: {
    primary: 'Listening',
    secondary: 'Awaiting Operator Input',
  },
  speaking: {
    primary: 'Speaking',
    secondary: 'Briefing In Progress',
  },
  alert: {
    primary: 'Attention',
    secondary: 'Critical Observation Required',
  },
}

export type StuartOrbProps = {
  status?: StuartOrbStatus
  className?: string
  showStatus?: boolean
}

export function StuartOrb({
  status = 'monitoring',
  className,
  showStatus = true,
}: StuartOrbProps) {
  const presence = PRESENCE_STATUS[status]

  return (
    <div
      className={`stuart-orb-wrap stuart-orb-wrap--${status}${className ? ` ${className}` : ''}`}
      role="img"
      aria-label={`Stuart ${presence.primary}`}
    >
      <div className="stuart-orb-presence">
        <div className="stuart-orb-stage" aria-hidden="true">
          <div className="stuart-orb-ambient" />
          <img
            className="stuart-orb-artwork"
            src={stuartOrbArtwork}
            alt=""
            width={380}
            height={380}
            decoding="async"
          />
        </div>

        {showStatus ? (
          <div className="stuart-orb-status">
            <div className="stuart-orb-status-primary">{presence.primary}</div>
            <div className="stuart-orb-status-secondary">{presence.secondary}</div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
