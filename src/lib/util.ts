type Constructor<T> = { new(): T }
type TestConstructor<T, U extends Constructor<T>> = U extends Constructor<infer V extends T> ? (obj: T) => obj is V : unknown;

/**
 * Generate function to test Node type.
 * 
 * # Example
 * 
 * ```ts
 * const testDiv = testNodeGen(HTMLDivElement)
 * const someNode = document.querySelector('div')
 * 
 * console.log(testDiv(someNode) === true)
 * ```
 */
export function testNodeGen<T extends Constructor<Node>>(nodeType: T): TestConstructor<Node, T> {
  // FIXME: Annotate type
  // @ts-ignore
  return (node: Node) => node instanceof nodeType
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

export function iterElementStack(target: HTMLElement): IteratorObject<HTMLElement> {
  function* gen() {
    let current: HTMLElement | null = target
    while (current != null) {
      yield current
      current = current.parentElement
    }
  }

  return Iterator.from(gen())
}

export function makeLogGroupCollapsedFn(...data: any[]) {
  let isGrouping = false
  function begin() {
    if (!isGrouping) {
      isGrouping = true
      console.groupCollapsed(...data)
    }
  }
  function end() {
    if (isGrouping) {
      console.groupEnd()
    }
  }
  function getState() {
    return isGrouping
  }

  return {
    beginLogGroup: begin,
    endLogGroup: end,
    isGrouping: getState,
  }
}

export function findStyles(selector: string) {
  return Iterator.from(document.styleSheets)
    .map(sheet => {
      try {
        const rules = sheet.cssRules
        return rules
      } catch (e) {
        // @ts-expect-error
        if (e.name !== 'SecurityError') throw e
        return undefined
      }
    })
    .filter(val => val != null)
    .flatMap(rules => Iterator.from(rules))
    .filter((rule): rule is CSSStyleRule => rule.constructor.name === CSSStyleRule.name)
    .filter(rule => rule.selectorText === selector)
    .toArray()
}
