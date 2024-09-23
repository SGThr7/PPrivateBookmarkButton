export function isElement(node: Node): node is Element {
  return node.nodeType === Node.ELEMENT_NODE
}

export const LogVerbosity = {
  None: 0,
  Error: 1,
  Warning: 2,
  Display: 3,
  Verbose: 4,
  Debug: 5,
} as const

export type LogVerbosity = typeof LogVerbosity[keyof typeof LogVerbosity]

export let CURRENT_LOG_VERBOSITY: LogVerbosity = LogVerbosity.Display

export function log(verbosity: LogVerbosity, msg: string, ...data: any[]) {
  if (!import.meta.env.DEV) return;
  if (verbosity > CURRENT_LOG_VERBOSITY) return;

  console.log(`[PixivPrivateBookmarkButton] ${msg}`, ...data)
}
