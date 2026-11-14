type AuthResult = { error: unknown };
type RecoveryAuth = {
  setSession(tokens: { access_token: string; refresh_token: string }): Promise<AuthResult>;
  exchangeCodeForSession(code: string): Promise<AuthResult>;
  verifyOtp(input: { token_hash: string; type: "recovery" }): Promise<AuthResult>;
  getUser(): Promise<{ data: { user: unknown }; error: unknown }>;
};

/** Parse and scrub credentials before constructing an SDK client. Never log tokens/errors. */
export async function recoverSession(
  location: { hash: string; search: string },
  clearCredentials: () => void,
  createAuth: () => RecoveryAuth,
): Promise<boolean> {
  const hash = new URLSearchParams(location.hash.replace(/^#/, ""));
  const search = new URLSearchParams(location.search);
  clearCredentials();
  try {
    if ([hash, search].some(params => params.has("error") || params.has("error_code"))) return false;
    const access = hash.get("access_token"), refresh = hash.get("refresh_token");
    const code = search.get("code"), tokenHash = search.get("token_hash");
    const type = hash.get("type") || search.get("type");
    const fragment = Boolean(access || refresh);
    // Reject ambiguous/mixed credential transports and incomplete fragments.
    if (Number(fragment) + Number(Boolean(code)) + Number(Boolean(tokenHash)) !== 1) return false;
    if (fragment && (!access || !refresh || type !== "recovery")) return false;
    if (tokenHash && type !== "recovery") return false;
    const auth = createAuth();
    const result = fragment
      ? await auth.setSession({ access_token: access!, refresh_token: refresh! })
      : code ? await auth.exchangeCodeForSession(code)
      : await auth.verifyOtp({ token_hash: tokenHash!, type: "recovery" });
    if (result.error) return false;
    const { data: { user }, error } = await auth.getUser();
    return Boolean(user && !error);
  } catch { return false; }
}
