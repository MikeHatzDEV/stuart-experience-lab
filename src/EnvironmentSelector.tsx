import { useEffect, useId, useRef, useState } from 'react'
import './EnvironmentSelector.css'

export type Environment = {
  id: string
  name: string
}

const STUART_CORE_LABEL = 'Stuart Core'

type EnvironmentSelectorProps = {
  currentEnvironment: Environment
  availableEnvironments: Environment[]
  onEnvironmentChange: (environment: Environment) => void
}

function EnvironmentIdentity({
  name,
  showCaret = false,
  variant = 'trigger',
}: {
  name: string
  showCaret?: boolean
  variant?: 'trigger' | 'option'
}) {
  return (
    <span className={`environment-identity environment-identity-${variant}`}>
      <span className="environment-identity-name">{name}</span>
      <span className="environment-identity-core">
        {STUART_CORE_LABEL}
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
        aria-label={`${currentEnvironment.name} ${STUART_CORE_LABEL}`}
        onClick={() => setOpen((prev) => !prev)}
      >
        <EnvironmentIdentity name={currentEnvironment.name} showCaret variant="trigger" />
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
                aria-label={`${environment.name} ${STUART_CORE_LABEL}`}
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
                <EnvironmentIdentity name={environment.name} variant="option" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
