"use client"

import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Button } from "@/components/ui/button"
import { EnhancedCard } from "@/components/ui/enhanced-card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Key,
  Save,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Loader2,
  ShieldCheck,
  Star,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import {
  listProvidersApi,
  addProviderApi,
  updateProviderApi,
  deleteProviderApi,
  verifyProviderApi,
  listProviderModelsApi,
  type AIProviderResponse,
  type AIProviderCreate,
  type AIProviderUpdate,
  type AIProviderVerifyResponse,
} from "@/lib/api/ai-providers"
import { invalidateAiConfig } from "@/hooks/use-ai-config"

const PROVIDER_OPTIONS = [
  { value: "gemini", label: "Gemini", needsBaseUrl: false },
  { value: "openrouter", label: "OpenRouter", needsBaseUrl: false },
  { value: "groq", label: "Groq", needsBaseUrl: false },
  { value: "custom", label: "Custom (OpenAI-compatible)", needsBaseUrl: true },
  { value: "nvidia-nim", label: "NVIDIA NIM", needsBaseUrl: false, defaultBaseUrl: "https://integrate.api.nvidia.com/v1" },
]

const PROVIDER_LABELS: Record<string, string> = Object.fromEntries(
  PROVIDER_OPTIONS.map((o) => [o.value, o.label]),
)

type FormState = {
  provider_name: string
  api_key: string
  base_url: string
  model: string
  is_default: boolean
}

const EMPTY_FORM: FormState = {
  provider_name: "",
  api_key: "",
  base_url: "",
  model: "",
  is_default: false,
}

export function AiSettingsPage() {
  const [providers, setProviders] = useState<AIProviderResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [showKey, setShowKey] = useState(false)
  const [saving, setSaving] = useState(false)

  const [availableModels, setAvailableModels] = useState<
    Array<{ id: string; name?: string }>
  >([])
  const [verifyingInline, setVerifyingInline] = useState(false)
  const [inlineVerifyResult, setInlineVerifyResult] =
    useState<AIProviderVerifyResponse | null>(null)
  const [modelCustomMode, setModelCustomMode] = useState(false)

  const [verifyOpen, setVerifyOpen] = useState(false)
  const [verifyTarget, setVerifyTarget] =
    useState<AIProviderResponse | null>(null)
  const [verifyKey, setVerifyKey] = useState("")
  const [verifyShowKey, setVerifyShowKey] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verifyResult, setVerifyResult] =
    useState<AIProviderVerifyResponse | null>(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] =
    useState<AIProviderResponse | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [loadingModels, setLoadingModels] = useState(false)

  const fetchProviders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listProvidersApi()
      setProviders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load providers")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProviders()
  }, [fetchProviders])

  const openAddDialog = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowKey(false)
    setAvailableModels([])
    setInlineVerifyResult(null)
    setModelCustomMode(false)
    setDialogOpen(true)
  }

  const openEditDialog = (p: AIProviderResponse) => {
    setEditingId(p.id)
    setForm({
      provider_name: p.provider_name,
      api_key: "",
      base_url: p.base_url || "",
      model: p.model || "",
      is_default: p.is_default,
    })
    setShowKey(false)
    setAvailableModels([])
    setInlineVerifyResult(null)
    setModelCustomMode(false)
    setDialogOpen(true)
  }

  const updateForm = (patch: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...patch }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editingId) {
        const update: AIProviderUpdate = {}
        if (form.api_key) update.api_key = form.api_key
        update.base_url = form.base_url || null
        update.model = form.model || null
        if (form.is_default) update.is_default = true
        await updateProviderApi(editingId, update)
      } else {
        const create: AIProviderCreate = {
          provider_name: form.provider_name,
          api_key: form.api_key,
          base_url: form.base_url || null,
          model: form.model || null,
          is_default: form.is_default,
          is_verified: inlineVerifyResult?.valid === true,
        }
        await addProviderApi(create)
      }
      setDialogOpen(false)
      invalidateAiConfig()
      await fetchProviders()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save provider")
    } finally {
      setSaving(false)
    }
  }

  const handleInlineVerify = async () => {
    if (!form.api_key) {
      return
    }
    setVerifyingInline(true)
    setInlineVerifyResult(null)
    try {
      const result = await verifyProviderApi({
        provider_name: form.provider_name,
        api_key: form.api_key,
        base_url: form.base_url || null,
      })
      setInlineVerifyResult(result)
      if (result.valid) {
        const models = result.models ?? []
        setAvailableModels(models)
        setModelCustomMode(false)
        if (models.length > 0) {
          updateForm({ model: models[0].id })
        }
      } else {
      }
    } catch (err) {
      setInlineVerifyResult({
        valid: false,
        error: err instanceof Error ? err.message : "Verification request failed",
      })
    } finally {
      setVerifyingInline(false)
    }
  }

  const openVerifyDialog = (p: AIProviderResponse) => {
    setVerifyTarget(p)
    setVerifyKey("")
    setVerifyShowKey(false)
    setVerifyResult(null)
    setVerifying(false)
    setVerifyOpen(true)
  }

  const handleVerify = async () => {
    if (!verifyTarget || !verifyKey) return
    setVerifying(true)
    setVerifyResult(null)
    try {
      const result = await verifyProviderApi({
        provider_name: verifyTarget.provider_name,
        api_key: verifyKey,
        base_url: verifyTarget.base_url,
      })
      setVerifyResult(result)
      if (result.valid) {
        setProviders((prev) =>
          prev.map((pr) =>
            pr.id === verifyTarget.id ? { ...pr, is_verified: true } : pr,
          ),
        )
      } else {
      }
    } catch (err) {
      setVerifyResult({
        valid: false,
        error: err instanceof Error ? err.message : "Verification request failed",
      })
    } finally {
      setVerifying(false)
    }
  }

  const openDeleteDialog = (p: AIProviderResponse) => {
    setDeleteTarget(p)
    setDeleting(false)
    setDeleteOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteProviderApi(deleteTarget.id)
      setProviders((prev) => prev.filter((p) => p.id !== deleteTarget.id))
      invalidateAiConfig()
      setDeleteOpen(false)
      setDeleteTarget(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete provider")
    } finally {
      setDeleting(false)
    }
  }

  const handleSetDefault = async (p: AIProviderResponse) => {
    try {
      await updateProviderApi(p.id, { is_default: true })
      await fetchProviders()
    } catch {
    }
  }

  const handleLoadModels = async () => {
    if (!editingId) return
    if (!form.api_key && !providers.find((p) => p.id === editingId)?.is_verified) {
      return
    }
    setLoadingModels(true)
    setAvailableModels([])
    try {
      const models = await listProviderModelsApi(editingId)
      if (models.length > 0) {
        setAvailableModels(models)
        setModelCustomMode(false)
        updateForm({ model: form.model || models[0].id })
      } else {
      }
    } catch {
    } finally {
      setLoadingModels(false)
    }
  }

  const selectedProviderNeedsBaseUrl = PROVIDER_OPTIONS.find(
    (o) => o.value === form.provider_name,
  )?.needsBaseUrl

  const canVerifyInline =
    form.provider_name &&
    form.api_key &&
    !verifyingInline

  const dialogTitle = editingId ? "Edit Provider" : "Add Provider"
  const dialogDesc = editingId
    ? "Update the provider configuration. Leave API key blank to keep the existing one."
    : "Configure a new AI provider."

  return (
    <DashboardShell title="AI Settings">
      <div className="max-w-3xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">AI Providers</h2>
            <p className="text-sm text-muted-foreground">
              Manage AI provider API keys and preferences.
            </p>
          </div>
          <Button variant="brand" onClick={openAddDialog} disabled={loading}>
            <Plus className="size-4" />
            Add Provider
          </Button>
        </div>

        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-card" />
            <Skeleton className="h-24 w-full rounded-card" />
          </div>
        )}

        {error && (
          <EnhancedCard hover={false} className="border-destructive/30">
            <div className="flex items-center gap-3">
              <AlertCircle className="size-5 shrink-0 text-destructive" />
              <div className="flex-1 text-sm text-destructive">
                <p className="font-medium">Failed to load providers</p>
                <p className="text-destructive/80">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={fetchProviders}>
                Retry
              </Button>
            </div>
          </EnhancedCard>
        )}

        {!loading && !error && providers.length === 0 && (
          <EnhancedCard hover={false} glow>
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Key className="size-8 text-muted-foreground/50" />
              <div>
                <p className="text-sm font-medium text-foreground">No AI providers configured</p>
                <p className="text-xs text-muted-foreground">
                  Add a provider to start using AI-powered features.
                </p>
              </div>
              <Button variant="brand" size="sm" onClick={openAddDialog}>
                <Plus className="size-4" />
                Add Provider
              </Button>
            </div>
          </EnhancedCard>
        )}

        {!loading && !error && providers.length > 0 && (
          <div className="space-y-3">
            {providers.map((p) => {
              const label = PROVIDER_LABELS[p.provider_name] || p.provider_name
              return (
                <EnhancedCard key={p.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">{label}</span>
                        {p.is_default && (
                          <Badge variant="brand">
                            <Star className="size-3" />
                            Default
                          </Badge>
                        )}
                        {p.is_verified ? (
                          <Badge variant="success">
                            <ShieldCheck className="size-3" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="warning">
                            <AlertCircle className="size-3" />
                            Unverified
                          </Badge>
                        )}
                      </div>
                      {p.base_url && (
                        <p className="text-xs text-muted-foreground break-all">
                          Base URL: {p.base_url}
                        </p>
                      )}
                      {p.model && (
                        <p className="text-xs text-muted-foreground">Model: {p.model}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => openVerifyDialog(p)}
                    >
                      <ShieldCheck className="size-3" />
                      Test Connection
                    </Button>
                    <Button variant="outline" size="xs" onClick={() => openEditDialog(p)}>
                      Edit
                    </Button>
                    {!p.is_default && (
                      <Button variant="outline" size="xs" onClick={() => handleSetDefault(p)}>
                        <Star className="size-3" />
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="xs"
                      onClick={() => openDeleteDialog(p)}
                    >
                      <Trash2 className="size-3" />
                      Delete
                    </Button>
                  </div>
                </EnhancedCard>
              )
            })}
          </div>
        )}

        {/* Add / Edit Provider Dialog */}
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            if (!saving) setDialogOpen(open)
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
              <DialogDescription>{dialogDesc}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {editingId ? (
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">Provider</label>
                  <div className="rounded-lg border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                    {PROVIDER_LABELS[form.provider_name] || form.provider_name}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">Provider</label>
                  <Select
                    value={form.provider_name}
                    onValueChange={(value) => {
                      const opt = PROVIDER_OPTIONS.find((o) => o.value === value)
                      updateForm({
                        provider_name: value ?? "",
                        base_url: opt?.defaultBaseUrl ?? "",
                      })
                      setAvailableModels([])
                      setInlineVerifyResult(null)
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a provider..." />
                    </SelectTrigger>
                    <SelectContent>
                      {PROVIDER_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">API Key</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showKey ? "text" : "password"}
                    value={form.api_key}
                    onChange={(e) => {
                      updateForm({ api_key: e.target.value })
                      setInlineVerifyResult(null)
                    }}
                    placeholder={editingId ? "Leave blank to keep existing" : "sk-... or API key"}
                    className="w-full rounded-lg border bg-background py-2 pl-9 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={handleInlineVerify}
                    disabled={!canVerifyInline}
                  >
                    {verifyingInline ? (
                      <>
                        <Loader2 className="size-3 animate-spin" />
                        Verifying...
                      </>
                    ) : inlineVerifyResult?.valid ? (
                      <>
                        <CheckCircle2 className="size-3 text-emerald-500" />
                        Re-verify
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="size-3" />
                        Verify & Fetch Models
                      </>
                    )}
                  </Button>
                  {inlineVerifyResult && !inlineVerifyResult.valid && (
                    <span className="ml-2 text-xs text-destructive">
                      {inlineVerifyResult.error || "Verification failed"}
                    </span>
                  )}
                </div>
              </div>

              {(selectedProviderNeedsBaseUrl || form.base_url) && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">Base URL</label>
                  <Input
                    type="url"
                    value={form.base_url}
                    onChange={(e) => updateForm({ base_url: e.target.value })}
                    placeholder={
                      selectedProviderNeedsBaseUrl
                        ? "https://..."
                        : "Optional: https://..."
                    }
                  />
                  {selectedProviderNeedsBaseUrl && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Required for this provider.
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Model</label>
                {availableModels.length > 0 && !modelCustomMode ? (
                  <div className="flex items-center gap-2">
                    <Select
                      value={form.model}
                      onValueChange={(value) => {
                        if (value === "__custom__") {
                          setModelCustomMode(true)
                          updateForm({ model: "" })
                        } else {
                          updateForm({ model: value ?? "" })
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a model..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableModels.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name || m.id}
                          </SelectItem>
                        ))}
                        <SelectItem value="__custom__">Custom…</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => setModelCustomMode(true)}
                      title="Enter model name manually"
                    >
                      <XCircle className="size-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      value={form.model}
                      onChange={(e) => updateForm({ model: e.target.value })}
                      placeholder="e.g. gpt-4o, gemini-2.0-flash"
                      className="flex-1"
                    />
                    {editingId && availableModels.length === 0 && (
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={handleLoadModels}
                        disabled={loadingModels}
                      >
                        {loadingModels ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <RefreshCw className="size-3" />
                        )}
                        Load Models
                      </Button>
                    )}
                  </div>
                )}
                {availableModels.length > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {modelCustomMode
                      ? "Enter a model name manually."
                      : `${availableModels.length} model${availableModels.length > 1 ? "s" : ""} available from provider.`}
                  </p>
                )}
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_default}
                  onChange={(e) => updateForm({ is_default: e.target.checked })}
                  className="peer sr-only"
                />
                <div className="relative h-5 w-9 rounded-full bg-muted after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-card after:transition-all peer-checked:bg-brand peer-checked:after:translate-x-full" />
                <span className="text-sm text-foreground">Set as default provider</span>
              </label>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button
                variant="brand"
                onClick={handleSave}
                disabled={saving || (!editingId && (!form.provider_name || !form.api_key))}
              >
                {saving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                {editingId ? "Update" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Verify Connection Dialog */}
        <Dialog
          open={verifyOpen}
          onOpenChange={(open) => {
            if (!verifying) setVerifyOpen(open)
            if (!open) setVerifyResult(null)
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Connection</DialogTitle>
              <DialogDescription>
                Verify the API key for{" "}
                <strong>
                  {verifyTarget
                    ? PROVIDER_LABELS[verifyTarget.provider_name] ||
                      verifyTarget.provider_name
                    : ""}
                </strong>
                .
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">API Key</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={verifyShowKey ? "text" : "password"}
                    value={verifyKey}
                    onChange={(e) => {
                      setVerifyKey(e.target.value)
                      setVerifyResult(null)
                    }}
                    placeholder="Enter the API key to test..."
                    className="w-full rounded-lg border bg-background py-2 pl-9 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={() => setVerifyShowKey(!verifyShowKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {verifyShowKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {verifyResult && (
                <div
                  className={`rounded-lg border p-3 text-sm ${
                    verifyResult.valid
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
                  }`}
                >
                  <div className="flex items-center gap-2 font-medium mb-1">
                    {verifyResult.valid ? (
                      <>
                        <CheckCircle2 className="size-4" />
                        Connection successful
                      </>
                    ) : (
                      <>
                        <XCircle className="size-4" />
                        Connection failed
                      </>
                    )}
                  </div>
                  {verifyResult.error && (
                    <p className="text-xs opacity-80">{verifyResult.error}</p>
                  )}
                  {verifyResult.valid && verifyResult.models && verifyResult.models.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium mb-1">Available models:</p>
                      <ul className="space-y-0.5">
                        {verifyResult.models.map((m) => (
                          <li key={m.id} className="text-xs opacity-80">
                            {m.name || m.id}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setVerifyOpen(false)} disabled={verifying}>
                Close
              </Button>
              <Button
                variant="brand"
                onClick={handleVerify}
                disabled={!verifyKey || verifying}
              >
                {verifying ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="size-4" />
                    Verify
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove Provider</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove{" "}
                <strong>
                  {deleteTarget
                    ? PROVIDER_LABELS[deleteTarget.provider_name] ||
                      deleteTarget.provider_name
                    : ""}
                </strong>
                ? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteOpen(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Removing...
                  </>
                ) : (
                  <>
                    <Trash2 className="size-4" />
                    Confirm Delete
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <EnhancedCard>
          <h3 className="mb-4 text-sm font-semibold text-foreground">Generation Preferences</h3>
          <div className="space-y-4">
            {[
              { label: "Auto-optimize on save", desc: "Run ATS optimization when saving a resume" },
              { label: "Include contact QR", desc: "Add a QR code to your contact section" },
              { label: "Suggest keywords from JD", desc: "Auto-extract keywords from job descriptions" },
              { label: "Enable grammar check", desc: "Check spelling and grammar in all sections" },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" defaultChecked className="peer sr-only" />
                  <div className="h-5 w-9 rounded-full bg-muted after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-card after:transition-all peer-checked:bg-brand peer-checked:after:translate-x-full" />
                </label>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end border-t pt-4">
            <Button variant="brand">
              <Save className="size-4" />
              Save Settings
            </Button>
          </div>
        </EnhancedCard>

        <EnhancedCard>
          <h3 className="mb-4 text-sm font-semibold text-foreground">Usage</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-foreground">AI Generations this month</span>
                <span className="text-xs text-muted-foreground">47 / 100</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[47%] rounded-full bg-brand" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Resets on July 1, 2026</p>
          </div>
        </EnhancedCard>
      </div>
    </DashboardShell>
  )
}
