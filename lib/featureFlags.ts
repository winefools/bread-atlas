export function isDbDisabled(): boolean {
  return process.env.DISABLE_DB === 'true'
}

export function dbSafeHandler<T>(defaultValue: T): T | Promise<T> {
  if (isDbDisabled()) {
    return defaultValue
  }
  return defaultValue
}