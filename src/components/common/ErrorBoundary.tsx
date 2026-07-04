import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // In production this is where you'd forward to Sentry / your error tracker.
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (!this.state.hasError) return this.props.children

    if (this.props.fallback) return this.props.fallback

    return (
      <div
        role="alert"
        className="flex flex-1 flex-col items-center justify-center p-12 text-center"
      >
        <AlertTriangle className="mb-4 h-12 w-12 text-amber-500" aria-hidden="true" />
        <h2 className="mb-2 text-lg font-semibold text-slate-900">Something went wrong</h2>
        <p className="mb-6 max-w-md text-sm text-slate-500">
          {this.state.error?.message ?? 'An unexpected error occurred while rendering this view.'}
        </p>
        <button onClick={this.handleReset} className="btn-primary">
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    )
  }
}
