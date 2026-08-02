export type RepositoryLicenseProduct = {
  license: string
  sourceCode?: {
    license?: string
  }
}

/**
 * Prefer the linked repository's license when classifying GitHub projects.
 * The distributed product may use a different license from its source repository.
 */
export function getRepositoryLicense(product: RepositoryLicenseProduct): string {
  return product.sourceCode?.license ?? product.license
}
