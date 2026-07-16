import {
  assertSourceDateSemantics,
  normalizeSourceDateClaims,
} from './sourceDateSemantics.mjs'

export function normalizeAndValidateReplaySource(source) {
  return assertSourceDateSemantics(normalizeSourceDateClaims(source))
}

export function validateActiveRegistrySource(source) {
  return assertSourceDateSemantics(source)
}
