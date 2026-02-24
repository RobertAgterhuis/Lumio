/**
 * RFC 9457 ProblemDetails response interface.
 * @see https://www.rfc-editor.org/rfc/rfc9457.html
 */
export interface ProblemDetails {
  /** A URI reference identifying the problem type */
  type?: string;
  /** A short, human-readable summary of the problem */
  title?: string;
  /** The HTTP status code */
  status?: number;
  /** A human-readable explanation specific to this occurrence */
  detail?: string;
  /** A URI reference identifying the specific occurrence */
  instance?: string;
  /** Validation errors keyed by field name (for 400 Bad Request) */
  errors?: Record<string, string[]>;
}

/**
 * Custom error class for API errors that implements RFC 9457 ProblemDetails.
 * Provides typed access to error details and validation errors.
 *
 * @example
 * ```typescript
 * try {
 *   await api.post("/api/erfgenamen", data);
 * } catch (err) {
 *   if (err instanceof ApiError) {
 *     // Access structured error information
 *     console.log(err.title);    // "Validatiefout"
 *     console.log(err.detail);   // "Naam is verplicht"
 *     console.log(err.status);   // 400
 *     console.log(err.errors);   // { "naam": ["is verplicht"] }
 *
 *     // Check for specific field errors
 *     if (err.hasFieldError("email")) {
 *       const emailErrors = err.getFieldErrors("email");
 *     }
 *   }
 * }
 * ```
 */
export class ApiError extends Error {
  readonly type: string;
  readonly title: string;
  readonly status: number;
  readonly detail: string;
  readonly instance?: string;
  readonly errors?: Record<string, string[]>;

  constructor(problemDetails: ProblemDetails) {
    // Use detail as message, falling back to title or generic message
    const message =
      problemDetails.detail ??
      problemDetails.title ??
      `HTTP ${problemDetails.status ?? 500}`;
    super(message);

    this.name = "ApiError";
    this.type = problemDetails.type ?? "https://httpstatuses.com/500";
    this.title = problemDetails.title ?? "Er is een fout opgetreden";
    this.status = problemDetails.status ?? 500;
    this.detail = problemDetails.detail ?? this.title;
    this.instance = problemDetails.instance;
    this.errors = problemDetails.errors;

    // Maintain proper stack trace in V8 environments
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Creates an ApiError from a Response object.
   * Attempts to parse the response body as ProblemDetails.
   */
  static async fromResponse(response: Response): Promise<ApiError> {
    let problemDetails: ProblemDetails = {
      status: response.status,
    };

    try {
      const body = await response.json();

      // Check if it's a ProblemDetails response
      if (body.type || body.title || body.detail || body.errors) {
        problemDetails = { ...problemDetails, ...body };
      }
      // Handle legacy { error: string } format
      else if (body.error) {
        problemDetails.detail = body.error;
      }
    } catch {
      // Failed to parse body, use status-based defaults
      problemDetails.title = getDefaultTitle(response.status);
    }

    // Fill in defaults if missing
    if (!problemDetails.type) {
      problemDetails.type = `https://httpstatuses.com/${response.status}`;
    }
    if (!problemDetails.title) {
      problemDetails.title = getDefaultTitle(response.status);
    }

    return new ApiError(problemDetails);
  }

  /**
   * Checks if there are validation errors for a specific field.
   */
  hasFieldError(fieldName: string): boolean {
    if (!this.errors) return false;
    const key = Object.keys(this.errors).find(
      (k) => k.toLowerCase() === fieldName.toLowerCase()
    );
    return key !== undefined && this.errors[key].length > 0;
  }

  /**
   * Gets validation errors for a specific field.
   * Returns an empty array if no errors exist for the field.
   */
  getFieldErrors(fieldName: string): string[] {
    if (!this.errors) return [];
    const key = Object.keys(this.errors).find(
      (k) => k.toLowerCase() === fieldName.toLowerCase()
    );
    return key ? this.errors[key] : [];
  }

  /**
   * Gets all validation errors as a flat array of messages.
   */
  getAllFieldErrors(): string[] {
    if (!this.errors) return [];
    return Object.values(this.errors).flat();
  }

  /**
   * Returns true if this is a validation error (400 with field errors).
   */
  isValidationError(): boolean {
    return this.status === 400 && this.errors !== undefined;
  }

  /**
   * Returns true if this is a not found error (404).
   */
  isNotFound(): boolean {
    return this.status === 404;
  }

  /**
   * Returns true if this is an authentication error (401).
   */
  isUnauthorized(): boolean {
    return this.status === 401;
  }

  /**
   * Returns true if this is a server error (5xx).
   */
  isServerError(): boolean {
    return this.status >= 500;
  }
}

/**
 * Gets default title for common HTTP status codes.
 */
function getDefaultTitle(status: number): string {
  switch (status) {
    case 400:
      return "Ongeldige aanvraag";
    case 401:
      return "Niet geautoriseerd";
    case 403:
      return "Toegang geweigerd";
    case 404:
      return "Niet gevonden";
    case 409:
      return "Conflict";
    case 422:
      return "Validatiefout";
    case 423:
      return "Vergrendeld";
    case 500:
      return "Serverfout";
    case 502:
      return "Bad Gateway";
    case 503:
      return "Service niet beschikbaar";
    default:
      return `HTTP ${status}`;
  }
}
