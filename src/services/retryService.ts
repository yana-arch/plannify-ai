interface RetryOptions {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryCondition?: (error: any) => boolean;
}

class RetryService {
  private readonly defaultOptions: RetryOptions = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
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

        // Calculate delay with exponential backoff
        const delay = Math.min(
          opts.baseDelay * Math.pow(opts.backoffMultiplier, attempt - 1),
          opts.maxDelay
        );

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
      retryCondition: (error) => {
        // Retry on network errors, timeouts, rate limits, and server errors
        if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
          return true;
        }
        if (error.status === 429) { // Rate limit
          return true;
        }
        if (error.status >= 500 && error.status < 600) {
          return true;
        }
        return false;
      },
      ...customOptions
    };

    return this.executeWithRetry(apiCall, options);
  }
}

export const retryService = new RetryService();
