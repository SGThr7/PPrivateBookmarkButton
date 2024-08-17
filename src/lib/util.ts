export function isElement(node: Node): node is Element {
  return node.nodeType === Node.ELEMENT_NODE
}

export const enum LogVerbosity {
  None,
  Error,
  Warning,
  Display,
  Verbose,
  Debug,
}

export let CURRENT_LOG_VERBOSITY: LogVerbosity = LogVerbosity.Display

export function log(verbosity: LogVerbosity, msg: string, ...data: any[]) {
  if (!import.meta.env.DEV) return
  if (verbosity > CURRENT_LOG_VERBOSITY) return

  console.log(`[PPBookmarkButton] ${msg}`, ...data)
}
