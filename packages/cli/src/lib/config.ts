// Cupel CLI — config persistante (~/.config/cupel)
import Conf from 'conf';

interface CLIConfig {
  token?: string;
  apiUrl: string;
  telemetryEnabled: boolean;
  installed: Record<string, { version: string; platform: string; installedAt: string }>;
}

export const config = new Conf<CLIConfig>({
  projectName: 'cupel',
  defaults: {
    apiUrl: process.env.CUPEL_API_URL ?? 'https://api.cupel.dev',
    telemetryEnabled: false,
    installed: {},
  },
});
