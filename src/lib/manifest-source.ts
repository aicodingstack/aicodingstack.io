export type ManifestCategory =
  | 'CLI'
  | 'DESKTOP'
  | 'EXTENSION'
  | 'IDE'
  | 'MODEL'
  | 'PROVIDER'
  | 'VENDOR'

const manifestDirectories: Record<ManifestCategory, string> = {
  CLI: 'clis',
  DESKTOP: 'desktops',
  EXTENSION: 'extensions',
  IDE: 'ides',
  MODEL: 'models',
  PROVIDER: 'providers',
  VENDOR: 'vendors',
}

export function getManifestEditUrl(category: ManifestCategory, manifestId: string): string {
  const directory = manifestDirectories[category]
  return `https://github.com/aicodingstack/aicodingstack.io/edit/main/manifests/${directory}/${encodeURIComponent(manifestId)}.json`
}
