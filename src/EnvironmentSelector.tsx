import { useEffect, useId, useRef, useState } from 'react'
import './EnvironmentSelector.css'

export type Environment = {
  id: string
  name: string
  coreLabel: string
  coreVersion: string
}

type EnvironmentSelectorProps = {
  currentEnvironment: Environment
  availableEnvironments: Environment[]
  onEnvironmentChange: (environment: Environment) => void
}

function formatCoreLine(environment: Pick<Environment, 'coreLabel' | 'coreVersion'>): string {
  return `${environment.coreLabel} · ${environment.coreVersion}`
}

function EnvironmentIdentity({
  environment,
  showCaret = false,
  variant = 'trigger',
}: {
  environment: Pick<Environment, 'name' | 'coreLabel' | 'coreVersion'>
  showCaret?: boolean
  variant?: 'trigger' | 'option'
}) {
  return (
    <span className={`environment-identity environment-identity-${variant}`}>
      <span className="environment-identity-name">{environment.name}</span>
      <span className="environment-identity-core">
        <span className="environment-identity-core-line">{formatCoreLine(environment)}</span>
        {showCaret ? (
          <span className="environment-selector-caret" aria-hidden="true">
            ▼
          </span>
        ) : null}
      </span>
    </span>
  )
}

export function EnvironmentSelector({
  currentEnvironment,
  availableEnvironments,
  onEnvironmentChange,
}: EnvironmentSelectorProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const currentCoreLine = formatCoreLine(currentEnvironment)

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const handleSelect = (environment: Environment) => {
    onEnvironmentChange(environment)
    setOpen(false)
  }

  return (
    <div
      ref={rootRef}
      className={`environment-selector${open ? ' is-open' : ''}`}
    >
      <button
        type="button"
        className="environment-selector-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${currentEnvironment.name} ${currentCoreLine}`}
        onClick={() => setOpen((prev) => !prev)}
      >
        <EnvironmentIdentity environment={currentEnvironment} showCaret variant="trigger" />
      </button>

      {open ? (
        <div className="environment-selector-menu" role="listbox" id={listId} aria-label="Select Stuart Core">
          {availableEnvironments.map((environment, index) => (
            <div key={environment.id}>
              {index === 1 ? <div className="environment-selector-divider" role="separator" /> : null}
              <button
                type="button"
                role="option"
                aria-selected={environment.id === currentEnvironment.id}
                aria-label={`${environment.name} ${formatCoreLine(environment)}`}
                className={`environment-selector-option${
                  environment.id === currentEnvironment.id ? ' is-selected' : ''
                }`}
                onClick={() => handleSelect(environment)}
              >
                {environment.id === currentEnvironment.id ? (
                  <span className="environment-selector-check" aria-hidden="true">
                    ✓
                  </span>
                ) : (
                  <span className="environment-selector-check-placeholder" aria-hidden="true" />
                )}
                <EnvironmentIdentity environment={environment} variant="option" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
