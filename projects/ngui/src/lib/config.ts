import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core';

export interface AtmusUiConfig {
  /** 'light' | 'dark' | 'system' — initial theme. Persisted in localStorage afterwards. */
  theme?: 'light' | 'dark' | 'system';
  /** Base URL used by remote components (atm-dropdown-remote) e.g. https://api.example.com/v1 */
  serverUrl?: string;
}

export const ATMUS_UI_CONFIG = new InjectionToken<AtmusUiConfig>('ATMUS_UI_CONFIG', {
  factory: () => ({}),
});

/** Standalone-friendly provider: provideAtmusUi({ theme: 'system', serverUrl: env.serverUrl }) */
export function provideAtmusUi(config: AtmusUiConfig = {}): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: ATMUS_UI_CONFIG, useValue: config }]);
}
