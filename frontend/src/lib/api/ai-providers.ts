import { api } from "./client"

export type AIProviderResponse = {
  id: string
  provider_name: string
  base_url: string | null
  model: string | null
  is_default: boolean
  is_verified: boolean
}

export type AIProviderCreate = {
  provider_name: string
  api_key: string
  base_url?: string | null
  model?: string | null
  is_default?: boolean
}

export type AIProviderUpdate = {
  api_key?: string | null
  base_url?: string | null
  model?: string | null
  is_default?: boolean | null
}

export type AIProviderVerifyRequest = {
  provider_name: string
  api_key: string
  base_url?: string | null
}

export type AIProviderVerifyResponse = {
  valid: boolean
  models?: Array<{ id: string; name?: string }>
  error?: string
}

const PROVIDER_BASE = "/settings/ai"

export async function listProvidersApi(): Promise<AIProviderResponse[]> {
  return api.get<AIProviderResponse[]>(PROVIDER_BASE)
}

export async function addProviderApi(data: AIProviderCreate): Promise<AIProviderResponse> {
  return api.post<AIProviderResponse>(PROVIDER_BASE, data)
}

export async function updateProviderApi(
  id: string,
  data: AIProviderUpdate,
): Promise<AIProviderResponse> {
  return api.patch<AIProviderResponse>(`${PROVIDER_BASE}/${id}`, data)
}

export async function deleteProviderApi(id: string): Promise<void> {
  await api.delete(`${PROVIDER_BASE}/${id}`)
}

export async function verifyProviderApi(
  data: AIProviderVerifyRequest,
): Promise<AIProviderVerifyResponse> {
  return api.post<AIProviderVerifyResponse>(`${PROVIDER_BASE}/verify`, data)
}

export async function listProviderModelsApi(
  id: string,
): Promise<Array<{ id: string; name?: string }>> {
  return api.get<Array<{ id: string; name?: string }>>(`${PROVIDER_BASE}/${id}/models`)
}
