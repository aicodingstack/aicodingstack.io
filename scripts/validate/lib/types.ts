/**
 * Type definitions for i18n validation script
 */

/**
 * File type classification
 */
export enum FileType {
  PAGE = 'page',
  COMPONENT = 'component',
  UNKNOWN = 'unknown',
}

/**
 * Violation types
 */
export enum ViolationType {
  NAMESPACE = 'namespace',
  MISSING_KEY = 'missing_key',
}

/**
 * Source location in a file
 */
export interface SourceLocation {
  file: string
  line: number
  column: number
}

/**
 * A single translation function call
 */
export interface TranslationCall {
  key: string
  keyType: 'static' | 'dynamic' | 'partial'
  location: SourceLocation
}

/**
 * Translation usage detected in code
 */
export interface TranslationUsage {
  variableName: string
  namespace: string
  calls: TranslationCall[]
  location: SourceLocation
}

/**
 * Parsed file result
 */
export interface ParsedFile {
  path: string
  fileType: FileType
  usages: TranslationUsage[]
  error?: string
}

/**
 * Translation file info
 */
export interface TranslationFile {
  locale: string
  namespace: string
  path: string
  keys: Set<string>
  raw: unknown
}

/**
 * Location of a translation key
 */
export interface TranslationLocation {
  locale: string
  namespace: string
  file: string
}

/**
 * Index of all translation files
 */
export interface TranslationIndex {
  byNamespace: Map<string, TranslationFile[]>
  byKey: Map<string, TranslationLocation[]>
  allFiles: TranslationFile[]
  atReferences: AtReference[]
}

/**
 * An @: reference in translation files
 */
export interface AtReference {
  sourceFile: string
  sourceKey: string
  targetKey: string
  locale: string
}

/**
 * Base violation
 */
export interface BaseViolation {
  type: ViolationType
  file: string
  line: number
  column: number
}

/**
 * Namespace violation
 */
export interface NamespaceViolation extends BaseViolation {
  type: ViolationType.NAMESPACE
  fileType: FileType
  variableName: string
  namespace: string
}

/**
 * Missing translation key violation
 */
export interface MissingKeyViolation extends BaseViolation {
  type: ViolationType.MISSING_KEY
  variableName: string
  namespace: string
  key: string
}

/**
 * Union type of all violations
 */
export type Violation = NamespaceViolation | MissingKeyViolation

/**
 * Warning type
 */
export enum WarningType {
  DYNAMIC_KEY = 'dynamic_key',
  SYNTAX_ERROR = 'syntax_error',
  MISSING_TRANSLATION_FILE = 'missing_translation_file',
}

/**
 * Base warning
 */
export interface BaseWarning {
  type: WarningType
  file: string
}

/**
 * Dynamic key warning
 */
export interface DynamicKeyWarning extends BaseWarning {
  type: WarningType.DYNAMIC_KEY
  line: number
  column: number
  variableName: string
  namespace: string
  description: string
}

/**
 * Syntax error warning
 */
export interface SyntaxErrorWarning extends BaseWarning {
  type: WarningType.SYNTAX_ERROR
  error: string
}

/**
 * Missing translation file warning
 */
export interface MissingTranslationFileWarning extends BaseWarning {
  type: WarningType.MISSING_TRANSLATION_FILE
  namespace: string
  locale: string
}

/**
 * Union type of all warnings
 */
export type Warning = DynamicKeyWarning | SyntaxErrorWarning | MissingTranslationFileWarning

/**
 * Validation summary
 */
export interface ValidationSummary {
  filesScanned: number
  pages: number
  components: number
  translationKeys: number
  violations: {
    total: number
    namespaceViolations: number
    missingKeys: number
  }
  atReferences: {
    total: number
    filesWithReferences: number
  }
  warnings: {
    total: number
  }
  passed: boolean
}

/**
 * Complete validation report
 */
export interface ValidationReport {
  summary: ValidationSummary
  violations: Violation[]
  warnings: Warning[]
}

/**
 * Reporter output format
 */
export enum OutputFormat {
  CONSOLE = 'console',
  JSON = 'json',
}

/**
 * Validation options
 */
export interface ValidationOptions {
  locale?: string
  format: OutputFormat
  output?: string
}
