import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component to catch and handle React rendering errors
 * Displays a fallback UI instead of crashing the entire app
 */
class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ errorInfo });

        // Here you could send to error tracking service like Sentry
        // logErrorToService(error, errorInfo);
    }

    handleRetry = (): void => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            // Custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="min-h-[200px] flex items-center justify-center p-8">
                    <div className="glass rounded-3xl p-8 max-w-md text-center border border-rose-500/20">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-rose-400" />
                        </div>

                        <h2 className="text-xl font-bold text-white mb-2">
                            Eitthvað fór úrskeiðis
                        </h2>

                        <p className="text-slate-400 text-sm mb-6">
                            Villa kom upp við að birta þennan hluta. Reyndu að endurhlaða síðunni.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mb-6 p-3 bg-black/30 rounded-xl text-left">
                                <p className="text-xs text-rose-300 font-mono break-all">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}

                        <button
                            onClick={this.handleRetry}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 
                         text-white font-semibold rounded-xl transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Reyna aftur
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
