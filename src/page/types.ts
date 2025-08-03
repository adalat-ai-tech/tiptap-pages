import { type Attrs, type NodeType, type Schema, Mark, type Node } from '@tiptap/pm/model';
import { type Transaction } from '@tiptap/pm/state';
import { type SplitContext } from './computed';

/**
 * The computed function for the page extension of a node.
 * @param splitContex The split context.
 * @param node The current node to be computed.
 * @param pos The position of the current node.
 * @param parent The parent node of the current node.
 * @param dom The DOM element of the current node.
 * @param startIndex The start index of the current node.
 * @returns If true, the child nodes of the current node will be computed.
 */
export type ComputedFn = (splitContex: SplitContext, node: Node, pos: number, parent: Node | null, dom: HTMLElement) => boolean;

export type NodesComputed = Record<string, ComputedFn>;

export interface PageOptions {
  types: never[];
  footerHeight: number;
  headerHeight: number;
  bodyHeight: number;
  bodyWidth: number;
  bodyPadding: number;
  headerData?: unknown[];
  footerData?: unknown[];
}

export type SplitParams = {
  pos: number;
  depth?: number;
  typesAfter?: ({ type: NodeType; attrs?: Attrs | null } | null)[];
  schema: Schema<string, string>;
  force?: boolean;
};

export class PageState {
  bodyOptions: PageOptions;
  deleting: boolean;
  inserting: boolean;
  splitPage: boolean;
  constructor(bodyOptions: PageOptions, deleting: boolean, inserting: boolean, splitPage: boolean) {
    this.bodyOptions = bodyOptions;
    this.deleting = deleting;
    this.inserting = inserting;
    this.splitPage = splitPage;
  }
  transform(tr: Transaction) {
    const splitPage: boolean = tr.getMeta('splitPage') as boolean;
    const deleting: boolean = tr.getMeta('deleting') as boolean;
    const inserting: boolean = tr.getMeta('inserting') as boolean;
    const splitPage1 = splitPage ? splitPage : false;
    const inserting2 = inserting ? inserting : false;
    const deleting3 = deleting ? deleting : false;
    return new PageState(this.bodyOptions, deleting3, inserting2, splitPage1);
  }
}

export type SplitInfo = {
  pos: number;
  depth: number;
  attributes?: Record<string, unknown>;
};
