// Forgekit CLI — config persistante (~/.config/forgekit)
import Conf from 'conf';

interface CLIConfig {
  token?: string;
  apiUrl: string;
  telemetryEnabled: boolean;
  installed: Record<string, { version: string; platform: string; installedAt: string }>;
}

export const config = new Conf<CLIConfig>({
  projectName: 'forgekit',
  defaults: {
    apiUrl: process.env.FORGEKIT_API_URL ?? 'https://api.forgekit.dev',
    telemetryEnabled: false,
    installed: {},
  },
});
