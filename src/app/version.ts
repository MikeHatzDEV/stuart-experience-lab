import packageJson from '../../package.json'

/** Hosted Stuart Experience Lab frontend product name. */
export const EXPERIENCE_LAB_APP_NAME = 'Operations Assistant'

/** Hosted Stuart Experience Lab frontend version (from package.json). */
export const EXPERIENCE_LAB_VERSION: string = packageJson.version

/** Sidebar and future About/Diagnostics display label. */
export const EXPERIENCE_LAB_VERSION_LABEL = `${EXPERIENCE_LAB_APP_NAME} · ${EXPERIENCE_LAB_VERSION}`

/** Default label for a managed Stuart Core installation. */
export const DEFAULT_CORE_LABEL = 'Stuart Core'

/** Mock placeholder until live Core version is available per environment. */
export const MOCK_CORE_VERSION_PLACEHOLDER = 'Core v0.0.0-placeholder'
