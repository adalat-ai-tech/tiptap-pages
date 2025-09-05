import { type Attrs, type NodeType, type Schema, type Node } from '@tiptap/pm/model';
import { type Transaction } from '@tiptap/pm/state';
import { type SplitContext } from './computed';

/**
 * Paragraph spacing unit options
 */
export const ParagraphSpacingUnit = {
  Pts: 'PTS'
} as const;

/**
 * Margin unit options
 */
export const MarginUnit = {
  Cm: 'CM',
  Inches: 'INCHES'
} as const;

/**
 * Computed function for page extension node processing
 * @param splitContext - The split context for page operations
 * @param node - The current node to be computed
 * @param pos - The current node position
 * @param parent - The parent node of the current node
 * @param dom - The DOM element of the current node
 * @returns True if child nodes should be computed
 */
export type ComputedFn = (
  splitContext: SplitContext, 
  node: Node, 
  pos: number, 
  parent: Node | null, 
  dom: HTMLElement
) => boolean;

/**
 * Record of computed functions for different node types
 */
export type NodesComputed = Record<string, ComputedFn>;

/**
 * Page number position options
 */
export type PageNumberPosition = 'top' | 'bottom';

/**
 * Page number alignment options
 */
export type PageNumberAlignment = 'left' | 'center' | 'right';

/**
 * Margin configuration with unit and value
 */
export interface MarginConfig {
  unit: typeof MarginUnit[keyof typeof MarginUnit];
  value: number;
}

/**
 * Page margins configuration
 */
export interface PageMargins {
  top: MarginConfig;
  bottom: MarginConfig;
  left: MarginConfig;
  right: MarginConfig;
}

/**
 * Page number configuration
 */
export interface PageNumberConfig {
  show: boolean;
  showCount: boolean;
  showOnFirstPage: boolean;
  position: PageNumberPosition | null;
  alignment: PageNumberAlignment | null;
}

/**
 * Paragraph spacing configuration
 */
export interface ParagraphSpacingConfig {
  before: {
    unit: typeof ParagraphSpacingUnit[keyof typeof ParagraphSpacingUnit];
    value: number;
  };
  after: {
    unit: typeof ParagraphSpacingUnit[keyof typeof ParagraphSpacingUnit];
    value: number;
  };
}

/**
 * Page layout configuration
 */
export interface PageLayoutConfig {
  margins?: PageMargins;
  paragraphSpacing?: ParagraphSpacingConfig;
}

/**
 * Configuration options for page functionality
 * 
 * @example
 * ```typescript
 * PageExtension.configure({
 *   // REQUIRED - Must provide these for the extension to work
 *   bodyHeight: 1056,
 *   bodyWidth: 816,
 *   
 *   // OPTIONAL - These have sensible defaults
 *   footerHeight: 50,
 *   pageNumber: { show: true, position: 'bottom' }
 * })
 * ```
 */
export interface PageOptions {
  /**
   * REQUIRED: The height of each page in pixels
   * This is essential for page calculations and layout
   * @example bodyHeight: 1056 // A4 height at 96 DPI
   */
  bodyHeight: number;
  
  /**
   * REQUIRED: The width of each page in pixels
   * This is essential for page calculations and layout
   * @example bodyWidth: 816 // A4 width at 96 DPI
   */
  bodyWidth: number;
  
  /**
   * OPTIONAL: Internal padding within the page body
   * @default 0
   */
  bodyPadding?: number;
  
  /**
   * OPTIONAL: Height of the page header area
   * @default 30
   */
  headerHeight?: number;
  
  /**
   * OPTIONAL: Height of the page footer area
   * @default 30
   */
  footerHeight?: number;
  
  /**
   * OPTIONAL: Page layout settings (margins, spacing)
   * @default { margins: 0.5in all sides, paragraphSpacing: 6pt }
   */
  pageLayout?: PageLayoutConfig;
  
  /**
   * OPTIONAL: Page numbering settings
   * @default { show: false, position: null, alignment: null }
   */
  pageNumber?: PageNumberConfig;
  
  /**
   * OPTIONAL: Additional node types to support
   * @default []
   */
  types?: never[];
  
  /**
   * OPTIONAL: Header data for each page
   * @default []
   */
  headerData?: unknown[];
  
  /**
   * OPTIONAL: Footer data for each page
   * @default []
   */
  footerData?: unknown[];
}

/**
 * Default configuration values for PageExtension
 */
export const DEFAULT_PAGE_OPTIONS: Partial<PageOptions> = {
  bodyPadding: 0,
  headerHeight: 30,
  footerHeight: 30,
  types: [],
  headerData: [],
  footerData: [],
  pageLayout: {
    margins: {
      top: { unit: MarginUnit.Inches, value: 0.5 },
      bottom: { unit: MarginUnit.Inches, value: 0.5 },
      left: { unit: MarginUnit.Inches, value: 0.5 },
      right: { unit: MarginUnit.Inches, value: 0.5 }
    },
    paragraphSpacing: {
      before: { unit: ParagraphSpacingUnit.Pts, value: 6 },
      after: { unit: ParagraphSpacingUnit.Pts, value: 6 }
    }
  },
  pageNumber: {
    show: false,
    showCount: false,
    showOnFirstPage: false,
    position: null,
    alignment: null
  }
};

/**
 * Parameters for page splitting operations
 */
export type SplitParams = {
  pos: number;
  depth?: number;
  typesAfter?: ({ type: NodeType; attrs?: Attrs | null } | null)[];
  schema: Schema<string, string>;
  force?: boolean;
};

/**
 * Manages the state of page operations
 */
export class PageState {
  public bodyOptions: PageOptions;
  public deleting: boolean;
  public inserting: boolean;
  public splitPage: boolean;

  constructor(
    bodyOptions: PageOptions,
    deleting: boolean,
    inserting: boolean,
    splitPage: boolean
  ) {
    this.bodyOptions = bodyOptions;
    this.deleting = deleting;
    this.inserting = inserting;
    this.splitPage = splitPage;
  }

  /**
   * Transform the page state based on a transaction
   */
  transform(tr: Transaction): PageState {
    const splitPage = tr.getMeta('splitPage') as boolean ?? false;
    const inserting = tr.getMeta('inserting') as boolean ?? false;
    const deleting = tr.getMeta('deleting') as boolean ?? false;
    
    return new PageState(
      this.bodyOptions, 
      deleting, 
      inserting, 
      splitPage
    );
  }
}

/**
 * Information about page split operations
 */
export type SplitInfo = {
  pos: number;
  depth: number;
  attributes?: Record<string, unknown>;
};
