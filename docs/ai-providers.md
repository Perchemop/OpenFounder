# AI providers & API keys

OpenFounder can run its AI Co-Founder panel and all "AI Suggest / Auto-Fill"
actions against any model provider you choose — or none at all. The default is
the **built-in offline assistant**, which runs entirely in your browser and
never makes a network request.

## Setup: paste one key

Open **Settings → AI Providers**, pick a provider from the list, and paste its
API key. The app recognises the vendor from the key (for example `nvapi-…` for
NVIDIA NIM, `sk-ant-…` for Anthropic, `gsk_` for Groq) and fills in the
endpoint and a sensible starting model automatically — there are no base URLs
or model ids to copy from documentation.

After you paste a key, the app asks the provider which models that key can use
and offers them in the model picker, falling back to a curated list if the
network is unavailable.

## Providers

| Preset | Transport | Base URL | Default model | Notes |
|---|---|---|---|---|
| Built-in offline assistant | offline | none | — | Deterministic templates, 100% in-browser, free. Default. |
| NVIDIA NIM | OpenAI-compatible | `https://integrate.api.nvidia.com/v1` | `meta/llama-3.3-70b-instruct` | 100+ models via one key; free developer tier at build.nvidia.com. Keys start with `nvapi-`. |
| OpenRouter | OpenAI-compatible | `https://openrouter.ai/api/v1` | `meta-llama/llama-3.3-70b-instruct` | One key reaches models from most labs. `sk-or-…` |
| Groq | OpenAI-compatible | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile` | Very fast inference, generous free tier. `gsk_`. |
| Together AI | OpenAI-compatible | `https://api.together.xyz/v1` | `meta-llama/Llama-3.3-70B-Instruct-Turbo` | Open-weight models. `tgp_v1_`. |
| Fireworks AI | OpenAI-compatible | `https://api.fireworks.ai/inference/v1` | `accounts/fireworks/models/llama-v3p3-70b-instruct` | `fw_`. |
| Cerebras | OpenAI-compatible | `https://api.cerebras.ai/v1` | `llama-3.3-70b` | `csk-`. |
| Mistral AI | OpenAI-compatible | `https://api.mistral.ai/v1` | `mistral-large-latest` | EU-hosted. |
| DeepSeek | OpenAI-compatible | `https://api.deepseek.com/v1` | `deepseek-chat` | `deepseek-chat` / `deepseek-reasoner`. |
| xAI (Grok) | OpenAI-compatible | `https://api.x.ai/v1` | `grok-2-latest` | `xai-`. |
| Perplexity | OpenAI-compatible | `https://api.perplexity.ai` | `sonar` | Answers with web citations. `pplx-`. |
| OpenAI | OpenAI-compatible | `https://api.openai.com/v1` | `gpt-4o-mini` | `sk-…` |
| Anthropic (Claude) | Anthropic | `https://api.anthropic.com/v1` | `claude-3-5-sonnet-20241022` | `sk-ant-…` |
| Google Gemini (AI Studio) | Gemini | `generativelanguage.googleapis.com` | `gemini-2.0-flash` | `AIza…`. Free tier with a Google account. |
| Ollama (local) | Ollama | `http://localhost:11434` | `llama3.2` | Runs on your machine; no key, no network. |
| This app's own server | server | `GEMINI_API_KEY` on the server | `gemini-2.0-flash` | Only for the optional self-hosted Express server. |

Plus **Custom OpenAI-compatible endpoint** for any server speaking the OpenAI
chat-completions API: enter its base URL, key, and model.

## Privacy

- Keys are held in **session storage by default** (`openfounder_session_keys`)
  and disappear when the tab closes. Set "Store keys locally" to keep them in
  `localStorage` across restarts.
- A key is sent **only to the vendor you chose**:
  - *Offline Rules*: no network request is ever made, including for auto-fill.
  - *Direct provider*: browser → vendor directly.
  - *This app's server*: browser → your self-hosted server → Google.
- Nothing is ever used to train public models by OpenFounder, and OpenFounder
  has no access to your key.

## Timeouts and failures

Every AI request has a 45-second timeout. If a provider is unreachable, the
Co-Founder panel and auto-fill buttons fall back to deterministic templates
instead of hanging — you can always keep working offline.

## Developing

`src/ai/providerCatalog.ts` defines the presets and the key-prefix detection;
`src/ai/modelDiscovery.ts` lists a provider's models; `src/ai/http.ts` adds the
shared timeout/abort helper used by all providers.
