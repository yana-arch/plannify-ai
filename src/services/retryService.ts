interface RetryOptions {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter?: boolean;
  retryCondition?: (error: any) => boolean;
  onRetry?: (attempt: number, error: Error, delay: number) => void;
}

class RetryService {
  private readonly defaultOptions: RetryOptions = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    jitter: true,
    retryCondition: (error) => {
      // Retry on network errors, timeouts, and 5xx status codes
      if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
        return true;
      }
      if (error.status >= 500 && error.status < 600) {
        return true;
      }
      return false;
    }
  };

  private calculateDelay(baseDelay: number, multiplier: number, maxDelay: number, jitter: boolean): number {
    const delay = Math.min(baseDelay, maxDelay);
    const jitteredDelay = jitter ? delay * (0.5 + Math.random() * 0.5) : delay;
    return Math.floor(jitteredDelay);
  }

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: Partial<RetryOptions> = {}
  ): Promise<T> {
    const opts = { ...this.defaultOptions, ...options };
    let lastError: any;

    for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        // Don't retry if it's the last attempt
        if (attempt === opts.maxAttempts) {
          break;
        }

        // Check if we should retry this error
        if (opts.retryCondition && !opts.retryCondition(error)) {
          throw error;
        }

        // Calculate delay with exponential backoff and jitter
        const delay = this.calculateDelay(
          opts.baseDelay * Math.pow(opts.backoffMultiplier, attempt - 1),
          opts.backoffMultiplier,
          opts.maxDelay,
          opts.jitter!
        );

        // Call onRetry callback if provided
        if (opts.onRetry) {
          opts.onRetry(attempt, error, delay);
        }

        console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`, error);

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  // Specialized method for API calls with default retry logic
  async executeApiCall<T>(
    apiCall: () => Promise<T>,
    customOptions: Partial<RetryOptions> = {}
  ): Promise<T> {
    const options: RetryOptions = {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 5000,
      backoffMultiplier: 2,
      jitter: true,
      retryCondition: (error) => {
        // Enhanced retry conditions
        const message = error?.message?.toLowerCase() || '';
        const status = error?.status || error?.code;

        // Network and timeout errors
        if (error?.code === 'NETWORK_ERROR' || error?.code === 'TIMEOUT' ||
            message.includes('network') || message.includes('timeout')) {
          return true;
        }

        // Rate limiting
        if (status === 429 || message.includes('rate limit') || message.includes('quota')) {
          return true;
        }

        // Server errors
        if (status >= 500 && status < 600) {
          return true;
        }

        return false;
      },
      onRetry: (attempt, error, delay) => {
        console.log(`🔄 API Call Retry: ${attempt}/${options.maxAttempts} in ${delay}ms - ${error.message}`);
      },
      ...customOptions
    };

    return this.executeWithRetry(apiCall, options);
  }

  // Specialized method for AI operations with enhanced retry
  async executeAIOperation<T>(
    aiOperation: () => Promise<T>,
    operationName: string = 'AI Operation'
  ): Promise<T> {
    const options: RetryOptions = {
      maxAttempts: 5, // More attempts for AI operations
      baseDelay: 2000, // Longer initial delay
      maxDelay: 60000, // 1 minute max delay
      backoffMultiplier: 2.5, // Aggressive backoff
      jitter: true,
      retryCondition: (error) => {
        const message = error?.message?.toLowerCase() || '';
        const status = error?.status || error?.code;

        // Rate limits and quotas
        if (status === 429 || message.includes('quota') || message.includes('rate limit')) {
          return true;
        }

        // Network issues
        if (status >= 500 || error?.code === 'NETWORK_ERROR') {
          return true;
        }

        // Timeout or specific AI errors
        if (message.includes('timeout') || message.includes('overloaded')) {
          return true;
        }

        return false;
      },
      onRetry: (attempt, error, delay) => {
        console.log(`🤖 ${operationName}: Attempt ${attempt}/5 failed, retrying in ${delay}ms`);
        console.warn(`   Error: ${error.message}`);
      }
    };

    try {
      console.log(`🚀 Starting ${operationName}...`);
      const result = await this.executeWithRetry(aiOperation, options);
      console.log(`✅ ${operationName} completed successfully`);
      return result;
    } catch (error) {
      const finalError = new Error(`${operationName} failed after all retry attempts: ${error.message}`);
      finalError.name = 'AIRetryError';
      (finalError as any).originalError = error;
      throw finalError;
    }
  }
}

export const retryService = new RetryService();
