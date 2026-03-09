export function singleQuotedPowerShell(value: string): string;
export function trimText(value: unknown, maxLen?: number): string;
export function stripAnsi(value: unknown): string;
export function makePowerShellLaunchScript(argList: string, elevated: boolean): string;
export function runPowerShellLaunch(
  psScript: string,
  options?: { detailLimit?: number },
): Promise<{ ok: boolean; detail: string }>;
