import { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  /**
   * A component that will be rendered when an error is caught and passes the filter.
   * It receives the caught `error` and a `reset` function as props.
   * The `reset` function can be called to reset the error state and re-render the children.
   */
  fallback: React.ComponentType<{ error: Error; reset: () => void }>;
  children: ReactNode;
  /**
   * Optional function to determine if a caught error should be handled by this boundary.
   * If not provided, the boundary will catch all errors.
   */
  filter?: (error: Error) => boolean;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * A flexible Error Boundary component that can catch specific types of errors
 * or all errors, based on an optional `filter` prop.
 *
 * If `filter` is provided, it will only render the fallback if the
 * function returns true for the caught error.
 * If `filter` is not provided, it will catch and handle any `Error`.
 *
 * The `fallback` prop is a component that receives the caught `error` and a `reset` function.
 * The `reset` function can be called to reset the error state and re-render the children.
 *
 * Example Usage:
 *
 * // Define a fallback component
 * const MyFallbackComponent = ({ error, reset }) => (
 *   <div>
 *     <h2>Something went wrong!</h2>
 *     <p>{error.message}</p>
 *     <button onClick={reset}>Try Again</button>
 *   </div>
 * );
 *
 * // Catch specific UnauthorizedError
 * <ErrorBoundary
 *   fallback={MyFallbackComponent}
 *   filter={(e) => e instanceof UnauthorizedError}
 * >
 *   <ProtectedContent />
 * </ErrorBoundary>
 *
 * // Catch any other error (general error boundary)
 * <ErrorBoundary fallback={MyFallbackComponent}>
 *   <MainApplication />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
    this.reset = this.reset.bind(this);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(
      `Error caught by ${this.constructor.name}:`,
      error,
      errorInfo,
    );
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (this.state.error && this.props.children !== prevProps.children) {
      this.setState({ error: null });
    }
  }

  /**
   * Resets the error state, causing the ErrorBoundary to re-render its children.
   * This function is passed to the `fallback` component.
   */
  reset(): void {
    this.setState({ error: null });
  }

  render(): ReactNode {
    const {
      fallback: FallbackComponent,
      children,
      filter = (error) => error instanceof Error,
    } = this.props;
    const { error } = this.state;

    if (error && filter(error)) {
      return <FallbackComponent error={error} reset={this.reset} />;
    }

    return children;
  }
}
