# config

> Fonte: `src/core/ui/config.ts`

## Types / interfaces

### AtmusUiConfig

```ts
export interface AtmusUiConfig {
  /** 'light' | 'dark' | 'system' — initial theme. Persisted in localStorage afterwards. */
  theme?: 'light' | 'dark' | 'system';
  /** Base URL used by remote components (atm-dropdown-remote) e.g. https://api.example.com/v1 */
  serverUrl?: string;
}
```

