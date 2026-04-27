import { useEffect, useMemo, useRef, useState } from "react";
import { useKeyboard } from "../hooks/useKeyboard";

interface PublicApiToken {
  id: string;
  name: string;
  scopes: string[];
  createdAt: string;
  lastUsedAt?: string;
  expiresAt?: string | null;
}

interface CreateTokenResponse extends PublicApiToken {
  token: string;
}

type TokensResponse = { data: PublicApiToken[] };
type CreateResponse = { data: CreateTokenResponse };

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toISOString().slice(0, 10);
}

function formatExpiry(value?: string | null) {
  return value ? formatDate(value) : "NEV";
}

function tokenPreview(value: string) {
  const prefix = "st_run_live_";
  if (!value.startsWith(prefix)) return value;
  return `${prefix}${value.slice(prefix.length, prefix.length + 12)}...`;
}

export function TokenManager() {
  const [tokens, setTokens] = useState<PublicApiToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [rawToken, setRawToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [dismissArmed, setDismissArmed] = useState(false);
  const [pendingRevokeId, setPendingRevokeId] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const modalOpen = createOpen || rawToken !== null;
  const trimmedName = useMemo(() => name.trim(), [name]);

  async function loadTokens() {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/tokens");
      if (!response.ok) throw new Error("Failed to load tokens");
      const json = (await response.json()) as TokensResponse;
      setTokens(json.data);
    } catch {
      setError("Could not load tokens");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTokens();
  }, []);

  useEffect(() => {
    if (createOpen && !rawToken) {
      window.setTimeout(() => nameInputRef.current?.focus(), 0);
    }
  }, [createOpen, rawToken]);

  function openCreate() {
    setName("");
    setCreateError(null);
    setRawToken(null);
    setCopied(false);
    setCopyError(null);
    setDismissArmed(false);
    setCreateOpen(true);
  }

  function closeModal() {
    setCreateOpen(false);
    setRawToken(null);
    setCopied(false);
    setCopyError(null);
    setDismissArmed(false);
  }

  function requestDismiss() {
    if (rawToken && !copied && !dismissArmed) {
      setDismissArmed(true);
      return;
    }
    closeModal();
  }

  async function createToken(event?: { preventDefault: () => void }) {
    event?.preventDefault();
    if (creating) return;
    if (!trimmedName) {
      setCreateError("Name required");
      return;
    }

    setCreating(true);
    setCreateError(null);
    try {
      const response = await fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, expiresAt: null }),
      });
      if (!response.ok) throw new Error("Failed to create token");
      const json = (await response.json()) as CreateResponse;
      const { token, ...publicToken } = json.data;
      setTokens((current) => [publicToken, ...current]);
      setName(publicToken.name);
      setRawToken(token);
      setCopied(false);
      setDismissArmed(false);
      setCopyError(null);
    } catch {
      setCreateError("Could not create token");
    } finally {
      setCreating(false);
    }
  }

  async function copyRawToken() {
    if (!rawToken) return;
    setCopying(true);
    setCopyError(null);
    try {
      await navigator.clipboard.writeText(rawToken);
      setCopied(true);
      setDismissArmed(false);
    } catch {
      setCopyError("Copy failed");
    } finally {
      setCopying(false);
    }
  }

  async function revokeToken(tokenId: string) {
    if (pendingRevokeId !== tokenId) {
      setPendingRevokeId(tokenId);
      return;
    }

    setRevokingId(tokenId);
    setError(null);
    try {
      const response = await fetch(`/api/tokens/${encodeURIComponent(tokenId)}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to revoke token");
      setTokens((current) => current.filter((token) => token.id !== tokenId));
      setPendingRevokeId(null);
    } catch {
      setError("Could not revoke token");
    } finally {
      setRevokingId(null);
    }
  }

  useKeyboard({
    n: () => {
      if (!modalOpen) openCreate();
    },
    c: copyRawToken,
    Escape: requestDismiss,
  });

  return (
    <main className="px-2 py-4 md:p-8">
      <div className="grid grid-cols-12 gap-2 items-end mb-4">
        <div className="col-span-8 md:col-span-10">
          <p className="uppercase tracking-wide">TOKENS</p>
          <p className="opacity-60">Bearer tokens for API clients</p>
        </div>
        <div className="col-span-4 md:col-span-2 flex justify-end">
          <button
            type="button"
            onClick={openCreate}
            className="px-1 py-0.5 inline-grid place-items-center border tracking-wide uppercase disabled:opacity-50 hover:opacity-50 cursor-pointer"
          >
            <span className="w-[3ch]">NEW</span>
          </button>
        </div>
      </div>

      {error && <p className="mb-2 opacity-70">{error}</p>}

      <div className="grid grid-cols-12 gap-x-2 border-t divide-y">
        <div className="col-span-full grid grid-cols-subgrid py-1 uppercase opacity-60">
          <div className="col-span-5 md:col-span-4">Name</div>
          <div className="hidden md:flex md:col-span-2">Created</div>
          <div className="col-span-3 md:col-span-2">Last</div>
          <div className="col-span-2">Exp</div>
          <div className="col-span-2 flex justify-end">Act</div>
        </div>

        {loading ? (
          <div className="col-span-full py-4 opacity-60">Loading tokens...</div>
        ) : tokens.length === 0 ? (
          <div className="col-span-full py-4 opacity-60">No tokens</div>
        ) : (
          tokens.map((token) => (
            <div key={token.id} className="col-span-full grid grid-cols-subgrid py-1 items-center">
              <div className="col-span-5 md:col-span-4 overflow-hidden">
                <span className="truncate block">{token.name}</span>
              </div>
              <div className="hidden md:flex md:col-span-2">{formatDate(token.createdAt)}</div>
              <div className="col-span-3 md:col-span-2">{formatDate(token.lastUsedAt)}</div>
              <div className="col-span-2">{formatExpiry(token.expiresAt)}</div>
              <div className="col-span-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => void revokeToken(token.id)}
                  disabled={revokingId === token.id}
                  className="px-1 py-0.5 inline-grid place-items-center border tracking-wide uppercase disabled:opacity-50 hover:opacity-50 cursor-pointer"
                >
                  <span className="w-[4ch]">
                    {revokingId === token.id
                      ? "..."
                      : pendingRevokeId === token.id
                        ? "SURE"
                        : "REV"}
                  </span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 grid place-items-center p-4 bg-white/80 dark:bg-black/80">
          <div className="w-full max-w-[420px] border bg-white dark:bg-black p-6">
            {rawToken ? (
              <div className="grid gap-3">
                <div className="border px-3 py-2 overflow-hidden">
                  <span className="truncate block">{name}</span>
                </div>
                <div className="border grid grid-cols-[1fr_auto] items-center">
                  <div className="px-3 py-2 overflow-hidden">
                    <span className="truncate block">{tokenPreview(rawToken)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => void copyRawToken()}
                    disabled={copying}
                    className="px-3 py-2 border-l tracking-wide uppercase disabled:opacity-50 hover:opacity-50 cursor-pointer"
                  >
                    <span className="w-[3ch] inline-block">
                      {copying ? "..." : copied ? "CPD" : "CPY"}
                    </span>
                  </button>
                </div>

                {copyError && <p className="opacity-70">{copyError}</p>}
                {dismissArmed && (
                  <p className="opacity-70">Token not copied. Dismiss again to lose it.</p>
                )}

                <div className="flex justify-center pt-1">
                  <button
                    type="button"
                    onClick={requestDismiss}
                    className="underline hover:opacity-50 cursor-pointer"
                  >
                    {dismissArmed ? "Lose token" : "Dismiss"}
                  </button>
                </div>
              </div>
            ) : (
              <form className="grid gap-3" onSubmit={(event) => void createToken(event)}>
                <input
                  ref={nameInputRef}
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setCreateError(null);
                  }}
                  placeholder="name"
                  className="border bg-transparent px-3 py-2 outline-none"
                />

                {createError && <p className="opacity-70">{createError}</p>}

                <div className="flex justify-center gap-4 pt-1">
                  <button
                    type="submit"
                    disabled={creating}
                    className="underline disabled:opacity-50 hover:opacity-50 cursor-pointer"
                  >
                    {creating ? "Creating..." : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={requestDismiss}
                    className="underline hover:opacity-50 cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
