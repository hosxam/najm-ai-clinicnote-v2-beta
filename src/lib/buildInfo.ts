const configuredBuildSha = import.meta.env.VITE_BUILD_SHA?.trim()

export const buildMarker = configuredBuildSha ? configuredBuildSha.slice(0, 7) : 'local-dev'
