import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  onError?: () => void
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

/** Catches WebGL / R3F runtime failures and surfaces the static instrument fallback. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Aurora] render failure', error, info)
    this.props.onError?.()
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null
    }
    return this.props.children
  }
}
