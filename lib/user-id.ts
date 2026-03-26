/**
 * Generate a userId from request for tracking purposes.
 * Uses base64url encoding of IP for URL-safe identifier.
 * Note: base64 is reversible - this is NOT privacy protection.
 */
export function getUserIdFromRequest(req: Request): string {
    const forwardedFor = req.headers.get("x-forwarded-for")
    const rawIp = forwardedFor?.split(",")[0]?.trim() || "anonymous"
    return rawIp === "anonymous"
        ? rawIp
        : `user-${Buffer.from(rawIp).toString("base64url")}`
}

/**
 * Get headers to forward to LLM for user identification.
 * Configurable via USER_ID_HEADER and LLM_USER_ID_HEADER env vars.
 */
export function getLLMUserHeaders(req: Request): Record<string, string> {
    const userIdHeader = process.env.USER_ID_HEADER || "X-Forwarded-Email"
    const llmUserIdHeader =
        process.env.LLM_USER_ID_HEADER || "X-OpenWebUI-User-Id"

    const userId = req.headers.get(userIdHeader)
    if (userId) {
        return { [llmUserIdHeader]: userId }
    }
    return {}
}
