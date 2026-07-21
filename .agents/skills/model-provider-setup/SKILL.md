---
name: model-provider-setup
description: Configures Codex custom model providers in user-level config.toml. Use when a user wants Codex to connect to an OpenAI-compatible proxy, hosted provider, Azure endpoint, or local Ollama/LM Studio runtime.
---

# Model Provider Setup

Configure Codex model providers without exposing credentials or writing unsupported project-local settings.

## Safety and scope

- Read the current Codex configuration documentation before changing provider settings.
- Write provider configuration only to the user's `~/.codex/config.toml`. Codex ignores provider and credential-routing keys in project `.codex/config.toml`.
- Never write API keys into the repository, `config.toml`, chat output, or shell history. Store only the environment-variable name in `env_key` and let the user set its value securely.
- Preserve unrelated TOML settings and comments. Inspect the existing file before editing.
- Do not assume an Anthropic-compatible endpoint works with Codex. Confirm that the endpoint supports the wire API selected for Codex, normally the OpenAI Responses API.
- Do not guess model IDs. Obtain the exact ID from the provider's current official model catalog.

## Workflow

1. Read `references/providers.json` for maintained templates and limitations.
2. Determine the requested target:
   - built-in OpenAI provider with a different base URL;
   - custom hosted provider or proxy;
   - built-in local provider (`ollama` or `lmstudio`);
   - built-in Amazon Bedrock provider;
   - Azure OpenAI-compatible endpoint.
3. Verify the provider's current official documentation for:
   - base URL;
   - supported wire API;
   - exact model ID;
   - required authentication environment variable;
   - required query parameters or headers.
4. Show the proposed non-secret TOML diff before writing when the choice is ambiguous.
5. Obtain authorization to modify user-level configuration, then update `~/.codex/config.toml` while preserving unrelated settings.
6. Ask the user to set the required environment variable outside the repository. Never request that the secret be pasted into chat when a local secret store or shell environment is available.
7. Validate with a read-only command such as `codex --version` and, when available, a minimal provider/model listing or one-off invocation. Do not send a billable API request without user authorization.
8. Tell the user whether Codex must be restarted or a new session opened for the change to take effect.

## Configuration patterns

### Built-in OpenAI provider through a proxy

Use `openai_base_url` when only the built-in OpenAI provider's endpoint changes:

```toml
openai_base_url = "https://proxy.example.com/v1"
model = "provider-model-id"
```

### Custom provider

Use a non-reserved provider ID. `openai`, `ollama`, and `lmstudio` are reserved.

```toml
model = "provider-model-id"
model_provider = "example"

[model_providers.example]
name = "Example provider"
base_url = "https://api.example.com/v1"
env_key = "EXAMPLE_API_KEY"
wire_api = "responses"
```

Add only officially required headers or query parameters:

```toml
[model_providers.example]
http_headers = { "X-Example-Header" = "value" }
env_http_headers = { "X-Secret-Header" = "EXAMPLE_HEADER_VALUE" }
query_params = { api-version = "documented-version" }
```

### Local providers

Prefer Codex's built-in OSS mode instead of redefining reserved providers:

```toml
oss_provider = "ollama" # or "lmstudio"
```

Run Codex with `--oss`; use `--local-provider` for a one-off selection.

## Unsupported legacy configuration

Do not create `.Codex/settings.local.json` and do not set `ANTHROPIC_BASE_URL`, `ANTHROPIC_MODEL`, or `ANTHROPIC_AUTH_TOKEN` as a Codex configuration. Those settings describe a different client and wire protocol.

## Maintenance

- Keep `references/providers.json` limited to durable configuration templates. Do not hardcode a model catalog that becomes stale quickly.
- Prefer official Codex documentation for configuration semantics and official provider documentation for endpoint/model facts.
- Re-verify provider compatibility whenever Codex changes its supported wire APIs.
