export type Result<T> =
  | { ok: true; value: T }
  | {
      ok: false;
      error: {
        code: "configuration" | "unauthorized" | "validation" | "service";
        message: string;
      };
    };
export function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "No se pudo completar la operación. Intentá nuevamente.";
}
export async function attempt<T>(
  operation: () => Promise<T>,
): Promise<Result<T>> {
  try {
    return { ok: true, value: await operation() };
  } catch {
    return {
      ok: false,
      error: {
        code: "service",
        message:
          "No se pudo completar la operación. Revisá tu conexión o tus permisos.",
      },
    };
  }
}
