/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  CASSIE_BLOCK_EXTEND,
  EXTEND,
  HEADING,
  LISTITEM,
  PAGE,
  PARAGRAPH,
  ORDEREDLIST,
  BULLETLIST,
  TRANSIENT_TEXT,
} from '../node-names';
import { type ComputedFn, type NodesComputed, type PageState, type SplitParams, type SplitInfo } from './types';
import { Fragment, type Node, type Schema, Slice } from '@tiptap/pm/model';
import { type EditorState, type Transaction } from '@tiptap/pm/state';
import { getAbsentHtmlH, getBodyHeight, getBreakPos, getContentSpacing, getDefault, getDomHeight, getDomPaddingAndMargin } from './core';
import { getNodeType, type Editor } from '@tiptap/core';
import { ReplaceStep } from '@tiptap/pm/transform';
import { getId, findParentNodeClosestToPos } from '../utils/node';

/**
 * Default calculation logic for ordered and unordered lists
 * @param splitContext - Split context for page operations
 * @param node - Current node to be calculated
 * @param pos - Current node position
 * @param parent - Parent node of the current node
 * @param dom - DOM element of the current node
 * @returns True if child nodes should continue processing
 */
export const sameListCalculation: ComputedFn = (splitContext, _node, _pos, _parent, dom) => {
  const pHeight = getDomHeight(dom);
  
  // If the height of the list exceeds the pagination height, return to continue looping tr or li
  if (splitContext.isOverflow(pHeight)) return true;
  
  // If the height does not exceed the pagination height, accumulate the height
  splitContext.addHeight(pHeight);
  return false;
};

/**
 * Default calculation logic for list items, table rows, and paragraphs
 * @param splitContext - Split context for page operations
 * @param node - Current node to be calculated
 * @param pos - Current node position
 * @param parent - Parent node of the current node
 * @param dom - DOM element of the current node
 * @returns True if child nodes should continue processing
 */
export const sameItemCalculation: ComputedFn = (splitContext, node, pos, parent, dom) => {
  const chunks = splitContext.splitResolve(pos);
  const pHeight = getDomHeight(dom);
  
  if (!splitContext.isOverflow(pHeight)) {
    splitContext.addHeight(pHeight);
    return false;
  }
  
  if (pHeight > splitContext.getHeight()) {
    splitContext.addHeight(getDomPaddingAndMargin(dom));
    return true;
  }
  
  // Set boundary based on whether this is the first item
  const depth = parent?.firstChild === node ? chunks.length - 2 : chunks.length - 1;
  const boundaryPos = parent?.firstChild === node && chunks[chunks.length - 2]?.[2] 
    ? chunks[chunks.length - 2][2] as number 
    : pos;
    
  splitContext.setBoundary(boundaryPos, depth);
  return false;
};

/**
 * Default height calculation methods for different node types
 */
export const defaultNodesComputed: NodesComputed = {
  [ORDEREDLIST]: sameListCalculation,
  [BULLETLIST]: sameListCalculation,
  [LISTITEM]: sameItemCalculation,
  
  /**
   * Heading split algorithm - splits headings that exceed pagination height
   */
  [HEADING]: (splitContext, node, pos, _parent, dom) => {
    const pHeight = getDomHeight(dom);
    
    if (!splitContext.isOverflow(pHeight)) {
      splitContext.addHeight(pHeight);
      return false;
    }

    const chunks = splitContext.splitResolve(pos);
    const point = pHeight > splitContext.getHeight() ? getBreakPos(node, dom, splitContext) : null;
    
    splitContext.setBoundary(
      point ? pos + point : pos, 
      point ? chunks.length : chunks.length - 1
    );
    
    return false;
  },
  
  /**
   * Paragraph split algorithm - splits paragraphs that exceed pagination height
   */
  [PARAGRAPH]: (splitContext, node, pos, parent, dom) => {
    const pHeight = getDomHeight(dom);
    
    if (!splitContext.isOverflow(pHeight)) {
      splitContext.addHeight(pHeight);
      return false;
    }
    
    const chunks = splitContext.splitResolve(pos) as number[][];
    
    // Try to split if paragraph exceeds default height
    if (pHeight > splitContext.getDefaultHeight()) {
      const point = getBreakPos(node, dom, splitContext);
      if (point) {
        splitContext.setBoundary(pos + point, chunks.length);
        return false;
      }
    }
    
    // Set boundary based on position in parent
    if (parent?.firstChild === node) {
      const chunk = chunks[chunks.length - 2];
      if (chunk?.[2] && typeof chunk[2] === 'number') {
        splitContext.setBoundary(chunk[2], chunks.length - 2);
      }
    } else {
      splitContext.setBoundary(pos, chunks.length - 1);
    }
    
    return false;
  },
  
  /**
   * Transient text calculation - handles special text content
   */
  [TRANSIENT_TEXT]: (splitContext, _node, _pos, _parent, dom) => {
    const pHeight = getDomHeight(dom);
    const isOverflow = splitContext.isOverflow(pHeight);
    
    splitContext.addHeight(isOverflow ? getContentSpacing(dom) : pHeight);
    return isOverflow;
  },

  /**
   * Cassie block extend calculation - adds fixed height for extended blocks
   */
  [CASSIE_BLOCK_EXTEND]: (splitContext) => {
    splitContext.addHeight(8);
    return true;
  },
  
  /**
   * Page split algorithm - always returns the last page for splitting
   */
  [PAGE]: (splitContext, node) => {
    return node === splitContext.lastPage();
  },
};

/**
 * Pagination context class - manages page splitting operations
 */
export class SplitContext {
  #doc: Node; // Document
  #accumulatedHeight = 0; // Accumulated height
  #pageBoundary: SplitInfo | null = null; // Returned split point
  #height: number; // Pagination height
  #paragraphDefaultHeight: number; // Default height of the paragraph tag
  public attributes: Record<string, unknown> = {};
  public schema: Schema;

  /**
   * Constructor
   * @param schema - Document schema
   * @param doc - Document node
   * @param height - Pagination height
   * @param paragraphDefaultHeight - Default height of the paragraph tag
   */
  constructor(schema: Schema, doc: Node, height: number, paragraphDefaultHeight: number) {
    this.#doc = doc;
    this.#height = height;
    this.#paragraphDefaultHeight = paragraphDefaultHeight;
    this.schema = schema;
  }

  /**
   * Get the document
   */
  getDoc(): Node {
    return this.#doc;
  }

  /**
   * Get the pagination height
   */
  getHeight(): number {
    return this.#height;
  }

  /**
   * Get the accumulated height
   */
  getAccumulatedHeight(): number {
    return this.#accumulatedHeight;
  }

  /**
   * Get the default paragraph height
   */
  getDefaultHeight(): number {
    return this.#paragraphDefaultHeight;
  }

  /**
   * Check if adding height would cause overflow
   * @param height - Height to add
   * @returns Whether it would overflow
   */
  isOverflow(height: number): boolean {
    return this.#accumulatedHeight + height > this.#height;
  }

  /**
   * Test overflow with additional logic for height difference optimization
   * @param height - Height to test
   * @returns Whether it would overflow with optimization
   */
  isOverflowTest(height: number): boolean {
    const totalHeight = this.#accumulatedHeight + height;
    return totalHeight > this.#height && (totalHeight - this.#height) >= this.#paragraphDefaultHeight;
  }

  /**
   * Add height to accumulated total
   * @param height - Height to add
   */
  addHeight(height: number): void {
    this.#accumulatedHeight += height;
  }

  /**
   * Set the split point boundary
   * @param pos - Split point position
   * @param depth - Split point depth
   */
  setBoundary(pos: number, depth: number): void {
    this.#pageBoundary = { pos, depth };
  }

  /**
   * Get the current split point boundary
   */
  pageBoundary(): SplitInfo | null {
    return this.#pageBoundary;
  }

  /**
   * Resolve the split point into chunks for processing
   * @param pos - Split point position
   * @returns Array of position chunks
   */
  splitResolve(pos: number): (number | Node)[][] {
    // @ts-ignore
    const array = this.#doc.resolve(pos).path as (number | Node)[];
    
    if (array.length <= 3) return [array];
    
    const chunks: (number | Node)[][] = [];
    for (let i = 0; i < array.length; i += 3) {
      chunks.push(array.slice(i, i + 3));
    }
    
    return chunks;
  }

  /**
   * Get the last page node
   */
  lastPage(): Node | null {
    return this.#doc.lastChild;
  }
}

/**
 * PageComputedContext - Core pagination calculation class
 * 
 * Handles:
 * - Page splitting and merging
 * - Document state management
 * - Node height calculations
 * - Transaction processing
 */
export class PageComputedContext {
  public nodesComputed: NodesComputed;
  public state: EditorState;
  public tr: Transaction;
  public prevState: EditorState;
  public pageState: PageState;
  public editor: Editor;

  constructor(
    editor: Editor, 
    nodesComputed: NodesComputed, 
    pageState: PageState, 
    state: EditorState, 
    prevState: EditorState
  ) {
    this.editor = editor;
    this.nodesComputed = nodesComputed;
    this.tr = state.tr;
    this.state = state;
    this.pageState = pageState;
    this.prevState = prevState;
  }

  /**
   * Core execution logic for pagination
   */
  run(): Transaction {
    const { selection, doc } = this.state;
    const { inserting, deleting, splitPage }: PageState = this.pageState;
    
    this.removeElementsWithDuplicateId();
    
    if (splitPage) return this.initComputed();
    
    if (!inserting && deleting && selection.$head.node(1) === doc.lastChild && !this.tr.steps.length) {
      return this.tr;
    }
    
    if (inserting || deleting) {
      this.computed();
      this.checkNodeAndFix();
    }
    
    // If transaction returns an empty page, add a paragraph
    if (!this.tr.doc.firstChild?.content.size && this.prevState.doc.firstChild?.content.size) {
      const paragraph = this.state.schema.nodes.paragraph?.createAndFill();
      if (paragraph) {
        this.tr.insert(this.tr.doc.content.size - 1, paragraph);
      }
    }
    
    return this.tr;
  }

  /**
   * Remove elements with duplicate IDs to prevent conflicts
   */
  removeElementsWithDuplicateId(): void {
    const tr = this.tr;
    const { doc } = tr;
    const idMap = new Map<string, { node: Node; pos: number }>();
    const operations: ({ operation: 'delete'; from: number; to: number } | { operation: 'change-id'; from: number })[] = [];
    
    doc.descendants((node: Node, pos: number) => {
      const id = node.attrs.id as string;
      if (!id || node.type.name === 'text') return false;
      
      if (idMap.has(id)) {
        const oldNodeData = idMap.get(id)!;
        const newNodeData = { node, pos };
        const [deleteNode, preserveNode] = oldNodeData.node.nodeSize > newNodeData.node.nodeSize 
          ? [oldNodeData, newNodeData] 
          : [newNodeData, oldNodeData];
        
        const shouldDelete = preserveNode.node.textContent.includes(deleteNode.node.textContent) && 
                           deleteNode.node.children.length > 0;
        
        operations.push(shouldDelete ? {
          operation: 'delete' as const,
          from: deleteNode.pos + 1,
          to: deleteNode.pos + deleteNode.node.nodeSize + 1,
        } : {
          operation: 'change-id' as const,
          from: deleteNode.pos
        });
        
        idMap.set(id, preserveNode);
        return false;
      } else {
        idMap.set(id, { node, pos });
      }
    });
    
    operations.sort((a, b) => a.from - b.from);
    
    operations.forEach((operation) => {
      const mappedFrom = tr.mapping.map(operation.from);
      if (operation.operation === 'delete') {
        tr.deleteRange(mappedFrom, tr.mapping.map(operation.to));
      } else {
        tr.setNodeAttribute(mappedFrom, 'id', getId());
      }
    });
    
    this.tr = tr;
  }

  /**
   * Compute pagination for the current document state
   */
  computed(): Transaction {
    const tr = this.tr;
    const { selection } = this.state;
    
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const startNumber = tr.doc.content.findIndex(selection.from).index + 1;
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const curNumber = tr.doc.content.findIndex(selection.head).index + 1;

    if (tr.doc.childCount > 1 && (tr.doc.content.childCount !== curNumber || curNumber !== startNumber)) {
      this.mergeDocument();
    }
    
    this.splitDocument();
    return this.tr;
  }

  /**
   * Initialize pagination when the document starts loading
   */
  initComputed(): Transaction {
    this.mergeDefaultDocument(1);
    this.splitDocument();
    return this.tr;
  }

  /**
   * Recursively split pages until no more splitting is needed
   */
  splitDocument(): void {
    const { schema } = this.state;
    
    // eslint-disable-next-line no-constant-condition
    for (;;) {
      // Get the height of the last page, if the return value exists, it means it needs to be split
      const splitInfo: SplitInfo | null = this.getNodeHeight();
      if (!splitInfo) {
        break; // When no split is needed (i.e., splitInfo is null), exit the loop
      }
      
      const type = getNodeType(PAGE, schema);
      this.splitPage({
        pos: splitInfo.pos,
        depth: splitInfo.depth,
        typesAfter: [{ type }],
        schema: schema as Schema<string, string>,
      });
    }
  }

  /**
   * Merge pages starting from the count-th page
   * @param count - Starting page number for merging
   */
  mergeDefaultDocument(count: number): void {
    const tr = this.tr;
    
    while (tr.doc.content.childCount > count) {
      const nodeSize = tr.doc.content.lastChild?.nodeSize ?? 0;
      let depth = 1;
      
      // Check if we can merge with depth 2
      if (tr.doc.content.lastChild !== tr.doc.content.firstChild) {
        const prePage = tr.doc.content.child(tr.doc.content.childCount - 2);
        const lastPage = tr.doc.content.lastChild;
        
        const canMergeDeep = (lastPage?.firstChild?.type === prePage?.lastChild?.type || 
                             lastPage?.firstChild?.type.name.includes(EXTEND)) &&
                            lastPage?.firstChild?.attrs?.extend;
        
        if (canMergeDeep) depth = 2;
      }
      
      tr.join(tr.doc.content.size - nodeSize, depth);
    }
    
    this.tr = tr;
  }

  /**
   * Merge remaining documents and paginate the remaining documents
   * Depth judgment: If the first child tag of the remaining page is an extended type (split type of the main type), 
   * the depth is 2 when merging. If the first tag is not an extended type, the depth is 1
   */
  mergeDocument(): void {
    const tr = this.tr;
    const { selection } = this.state;
    
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unnecessary-type-assertion
    const count = (tr.doc.content.findIndex(selection.head).index + 1) as number;
    
    // Merge all pages into one page
    this.mergeDefaultDocument(count);
  }

  /**
   * Calculate the starting number for ordered lists that span multiple pages
   * @param listNode - The list node to calculate for
   * @param splitPos - The position where the list is split
   * @returns The starting number for the new page
   */
  calculateOrderedListStart(_listNode: Node, splitPos: number): number {
    const $pos = this.tr.doc.resolve(splitPos);
    const parentOrderedList = findParentNodeClosestToPos($pos, (node) => node.type.name === ORDEREDLIST);
    
    if (!parentOrderedList) return 1;
    
    const isPageSplit = parentOrderedList.node.attrs.extend === true;
    let totalItemCount = 0;
    
    if (isPageSplit) {
      // Count all items from beginning to split position
      this.tr.doc.descendants((node, pos) => {
        if (node.type.name === LISTITEM && pos < splitPos) {
          const $itemPos = this.tr.doc.resolve(pos);
          for (let depth = $itemPos.depth; depth > 0; depth--) {
            if ($itemPos.node(depth).type.name === ORDEREDLIST) {
              totalItemCount++;
              break;
            }
          }
        }
        return true;
      });
    } else {
      // Find sequence start and count items from there
      let currentPos = parentOrderedList.start;
      while (currentPos > 0 && this.tr.doc.resolve(currentPos - 1).node(this.tr.doc.resolve(currentPos - 1).depth).type.name === ORDEREDLIST) {
        currentPos = this.tr.doc.resolve(currentPos - 1).start(this.tr.doc.resolve(currentPos - 1).depth);
      }
      
      this.tr.doc.descendants((node, pos) => {
        if (node.type.name === LISTITEM && pos >= currentPos && pos < splitPos) {
          const $itemPos = this.tr.doc.resolve(pos);
          for (let depth = $itemPos.depth; depth > 0; depth--) {
            if ($itemPos.node(depth).type.name === ORDEREDLIST) {
              totalItemCount++;
              break;
            }
          }
        }
        return true;
      });
    }

    return totalItemCount + 1;
  }

  /**
   * Pagination main logic - modify the system tr split method, add default extend judgment, regenerate default id
   * @param params - Split parameters including position, depth, types after, and schema
   */
  splitPage({ pos, depth = 1, typesAfter, schema }: SplitParams): void {
    const tr = this.tr;
    const $pos = tr.doc.resolve(pos);
    let before = Fragment.empty;
    let after = Fragment.empty;
    
    for (let d = $pos.depth, e = $pos.depth - depth, i = depth - 1; d > e; d--, i--) {
      // Create a new node similar to $pos.node(d) with content as before
      before = Fragment.from($pos.node(d).copy(before));
      const typeAfter = typesAfter?.[i];
      const n = $pos.node(d);
      let na: Node | null | undefined = $pos.node(d).copy(after);

      if (schema.nodes[n.type.name + EXTEND]) {
        const attr = Object.assign({}, n.attrs, { id: getId() });
        na = schema.nodes[n.type.name + EXTEND]?.createAndFill(attr, after);
      } else {
        // Handle id duplication issue
        if (na?.attrs.id) {
          let extend = {};
          if (na.attrs.extend === false) {
            extend = { extend: true };
          }
          
          // Handle ordered list continuation across pages
          if (n.type.name === ORDEREDLIST) {
            const startNumber = this.calculateOrderedListStart(n, pos);
            extend = { ...extend, start: startNumber };
          }
          
          // Regenerate id
          const attr = Object.assign({}, n.attrs, { id: getId(), ...extend });
          
          if (after.size === 0) {
            na = schema.nodes[n.type.name]?.create(attr);
          } else {
            na = schema.nodes[n.type.name]?.createAndFill(attr, after);
          }
        }
      }
      
      after = Fragment.from(
        typeAfter
          ? typeAfter.type.create(
              {
                id: getId(),
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                pageNumber: na?.attrs.pageNumber + 1,
              },
              after
            )
          : na
      );
    }
    
    tr.step(new ReplaceStep(pos, pos, new Slice(before.append(after), depth, depth)));
    this.tr = tr;
  }

  /**
   * Check and fix paragraph line breaks caused by pagination
   */
  checkNodeAndFix(): Transaction {
    let tr = this.tr;
    const { doc } = tr;
    const { schema } = this.state;
    let beforeBlock: Node | null = null;
    
    doc.descendants((node: Node, pos: number) => {
      if (node.type === schema.nodes[PARAGRAPH] && node.attrs.extend === true) {
        if (beforeBlock === null) {
          beforeBlock = node;
        } else {
          // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
          const mappedPos = tr.mapping.map(pos);
          if (beforeBlock.type !== schema.nodes[PARAGRAPH]) {
            tr = tr.step(new ReplaceStep(mappedPos - 1, mappedPos + 1, Slice.empty));
          }
          return false;
        }
      }
    });
    
    this.tr = tr;
    return this.tr;
  }

  /**
   * Get the point that needs pagination and return it
   * @returns Split information if pagination is needed, null otherwise
   */
  getNodeHeight(): SplitInfo | null {
    const doc = this.tr.doc;
    const { bodyOptions } = this.pageState;
    const splitContext = new SplitContext(this.state.schema, doc, getBodyHeight(bodyOptions), getDefault());
    const nodesComputed = this.nodesComputed;
    const lastNode = doc.lastChild;
    
    doc.descendants((node: Node, pos: number, parentNode: Node | null) => {
      if (lastNode !== node && parentNode?.type.name === 'doc') {
        return false;
      }
      
      if (!splitContext.pageBoundary()) {
        let dom = document.querySelector(`[data-id="${node.attrs.id}"]`);
        if (!dom && node.type.name !== PAGE) {
          dom = getAbsentHtmlH(node, this.state.schema) ?? null;
        }
        
        // @ts-ignore
        return nodesComputed[node.type.name](splitContext, node, pos, parentNode, dom!);
      }
      
      return false;
    });
    
    return splitContext.pageBoundary() || null;
  }
}
