import { type Attrs, type NodeType, type Schema, type Node } from '@tiptap/pm/model';
import { type Transaction } from '@tiptap/pm/state';
import { type SplitContext } from './computed';


export const ParagraphSpacingUnit = {
  Pts: 'PTS'
} as const;


export const MarginUnit = {
  Cm: 'CM',
  Inches: 'INCHES'
} as const;


export type ComputedFn = (
  splitContext: SplitContext, 
  node: Node, 
  pos: number, 
  parent: Node | null, 
  dom: HTMLElement
) => boolean;


export type NodesComputed = Record<string, ComputedFn>;

export type PageNumberPosition = 'top' | 'bottom';


export type PageNumberAlignment = 'left' | 'center' | 'right';


export interface MarginConfig {
  unit: typeof MarginUnit[keyof typeof MarginUnit];
  value: number;
}


export interface PageMargins {
  top: MarginConfig;
  bottom: MarginConfig;
  left: MarginConfig;
  right: MarginConfig;
}


export interface PageNumberConfig {
  show: boolean;
  showCount: boolean;
  showOnFirstPage: boolean;
  position: PageNumberPosition | null;
  alignment: PageNumberAlignment | null;
}


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


export interface PageLayoutConfig {
  margins?: PageMargins;
  paragraphSpacing?: ParagraphSpacingConfig;
}


export interface PageOptions {

  bodyHeight: number;
  

  bodyWidth: number;
  

  bodyPadding?: number;
  

  headerHeight?: number;
  

  footerHeight?: number;
  

  pageLayout?: PageLayoutConfig;
  

  pageNumber?: PageNumberConfig;
  

  types?: never[];
  

  headerData?: unknown[];
  

  footerData?: unknown[];
}


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


export type SplitParams = {
  pos: number;
  depth?: number;
  typesAfter?: ({ type: NodeType; attrs?: Attrs | null } | null)[];
  schema: Schema<string, string>;
  force?: boolean;
};


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


export type SplitInfo = {
  pos: number;
  depth: number;
  attributes?: Record<string, unknown>;
};
