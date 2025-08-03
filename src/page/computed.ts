/* eslint-disable @typescript-eslint/ban-ts-comment */
import { HEADING, LISTITEM, PAGE, PARAGRAPH, ORDEREDLIST, BULLETLIST } from '../node-names';
import { type ComputedFn, type NodesComputed, type PageState, type SplitParams, type SplitInfo } from './types';
import { Fragment, type Node, type Schema, Slice } from '@tiptap/pm/model';
import { type EditorState, type Transaction } from '@tiptap/pm/state';
import { getAbsentHtmlH, getBodyHeight, getBreakPos, getContentSpacing, getDefault, getDomHeight, getDomPaddingAndMargin } from './core';
import { getNodeType, type Editor } from '@tiptap/core';
import { ReplaceStep } from '@tiptap/pm/transform';
import { getId } from '../utils/node';

/**
 * @description Default table ol ul list type common calculation logic
 * @param splitContex Split context
 * @param node Current node to be calculated
 * @param pos Current node position
 * @param parent Parent node of the current node
 * @param dom DOM of the current node
 */
export const sameListCalculation: ComputedFn = (splitContex, node, pos, parent, dom) => {
  const pHeight = getDomHeight(dom);
  // If the height of the list exceeds the pagination height, return to continue looping tr or li
  if (splitContex.isOverflow(pHeight)) return true;
  // If the height does not exceed the pagination height, accumulate the height
  splitContex.addHeight(pHeight);
  return false;
};
/**
 * @description Default LISTITEM TABLE_ROW paragraph type common calculation logic
 * @param splitContex Split context
 * @param node Current node to be calculated
 * @param pos Current node position
 * @param parent Parent node of the current node
 * @param dom DOM of the current node
 */
export const sameItemCalculation: ComputedFn = (splitContex, node, pos, parent, dom) => {
  const chunks = splitContex.splitResolve(pos) as number[][];
  const pHeight = getDomHeight(dom);
  if (splitContex.isOverflow(pHeight)) {
    if (pHeight > splitContex.getHeight()) {
      splitContex.addHeight(getDomPaddingAndMargin(dom));
      return true;
    }
    // If the current row is the first row of the list and has exceeded the pagination height, return to the previous level's split point
    if (parent?.firstChild === node) {
      splitContex.setBoundary(chunks[chunks.length - 2]![2]!, chunks.length - 2);
    } else {
      // If it is not the first row, return the current row's split point
      splitContex.setBoundary(pos, chunks.length - 1);
    }
  } else {
    splitContex.addHeight(pHeight);
  }
  return false;
};

// Default height calculation method
export const defaultNodesComputed: NodesComputed = {
  [ORDEREDLIST]: sameListCalculation,
  [BULLETLIST]: sameListCalculation,
  [LISTITEM]: sameItemCalculation,
  // [TABLE_ROW]: (splitContex, node, pos, parent, dom) => {
  //   const chunks = splitContex.splitResolve(pos);
  //   if (splitContex.isOverflow(0)) {
  //     if (count > 1) {
  //       count = 1;
  //       splitContex.setBoundary(chunks[chunks.length - 2][2], chunks.length - 2);
  //     } else {
  //       splitContex.setBoundary(pos, chunks.length - 1);
  //       count += 1;
  //     }
  //     return false;
  //   }
  //   const pHeight = getDomHeight(dom);
  //   if (splitContex.isOverflow(pHeight)) {
  //     if (pHeight > splitContex.getHeight()) {
  //       splitContex.addHeight(pHeight);
  //       return false;
  //     }
  //     // If the current row is the first row of the list and has exceeded the pagination height, return to the previous level's split point
  //     if (parent?.firstChild == node) {
  //       splitContex.setBoundary(chunks[chunks.length - 2][2], chunks.length - 2);
  //     } else {
  //       // If it is not the first row, return the current row's split point
  //       splitContex.setBoundary(pos, chunks.length - 1);
  //     }
  //   } else {
  //     splitContex.addHeight(pHeight);
  //   }
  //   return false;
  // },
  // [TABLE]: (splitContex, node, pos, parent, dom) => {
  //   const pHeight = getDomHeight(dom);
  //   // If the height of the table exceeds the pagination height, return to continue looping tr or li
  //   if (splitContex.isOverflow(pHeight)) return true;
  //   // If the height does not exceed the pagination height, accumulate the height
  //   splitContex.addHeight(pHeight);
  //   return false;
  // },
  /*
   * h1-h6 split algorithm. If the height of the heading exceeds the pagination height, return the current heading
   * @param splitContex Split context
   * @param node Current node to be calculated
   * @param pos Current node position
   * @param parent Parent node of the current node
   * @param dom DOM of the current node
   */
  [HEADING]: (splitContex, node, pos, parent, dom) => {
    const pHeight = getDomHeight(dom);
    if (!splitContex.isOverflow(pHeight)) {
      splitContex.addHeight(pHeight);
      return false;
    }

    const chunks = splitContex.splitResolve(pos);
    if (pHeight > splitContex.getHeight()) {
      const point = getBreakPos(node, dom, splitContex);
      if (point) {
        splitContex.setBoundary(pos + point, chunks.length);
        return false;
      }
    } else {
      // Directly return the current paragraph
      splitContex.setBoundary(pos, chunks.length - 1);
    }
    return false;
  },
  /**
   * p split algorithm. If the paragraph tag does not exceed the default paragraph height, directly return the paragraph split point, otherwise continue to calculate the split point within the paragraph
   * @param splitContex Split context
   * @param node Current node to be calculated
   * @param pos Current node position
   * @param parent Parent node of the current node
   * @param dom DOM of the current node
   */
  [PARAGRAPH]: (splitContex, node, pos, parent, dom) => {
    const pHeight = getDomHeight(dom);
    if (!splitContex.isOverflow(pHeight)) {
      splitContex.addHeight(pHeight);
      return false;
    }
    // If the current paragraph has exceeded the pagination height, directly split. Set skip to false to prevent re-entering when looping to the next paragraph
    const chunks = splitContex.splitResolve(pos);
    // Determine whether the paragraph needs to be split
    if (pHeight > splitContex.getDefaultHeight()) {
      const point = getBreakPos(node, dom, splitContex);
      if (point) {
        splitContex.setBoundary(pos + point, chunks.length);
        return false;
      }
    }
    // If the paragraph is the first node of the current block, directly return to the previous level's split point
    if (parent?.firstChild === node) {
      splitContex.setBoundary(chunks[chunks.length - 2]![2]!, chunks.length - 2);
      return false;
    }
    // Directly return the current paragraph
    splitContex.setBoundary(pos, chunks.length - 1);
    return false;
  },
  /**
   * page split algorithm. Always return the last page for splitting
   * @param splitContex Split context
   * @param node Current node to be calculated
   * @param pos Current node position
   * @param parent Parent node of the current node
   * @param dom DOM of the current node
   */
  [PAGE]: (splitContex, node, pos, parent, dom) => {
    return node == splitContex.lastPage();
  },
};
/**
 * Pagination context class
 */
export class SplitContext {
  #doc: Node; // Document
  #accumolatedHeight = 0; // Accumulated height
  #pageBoundary: SplitInfo | null = null; // Returned split point
  #height = 0; // Pagination height
  #paragraphDefaultHeight = 32; // Default height of the paragraph tag
  attributes: Record<string, unknown> = {};
  schema: Schema;

  /**
   * Get the document
   * @returns Document
   */
  getDoc() {
    return this.#doc;
  }

  /**
   * Constructor
   * @param doc Document
   * @param height Pagination height
   * @param paragraphDefaultHeight Default height of the paragraph tag
   */
  constructor(schema: Schema, doc: Node, height: number, paragraphDefaultHeight: number) {
    this.#doc = doc;
    this.#height = height;
    this.#paragraphDefaultHeight = paragraphDefaultHeight;
    this.schema = schema;
  }

  getHeight() {
    return this.#height;
  }

  getAccumulatedHeight() {
    return this.#accumolatedHeight;
  }

  /**
   * Get the default height
   * @returns Default height
   */
  getDefaultHeight() {
    return this.#paragraphDefaultHeight;
  }

  /**
   * Check if it overflows
   * @param height Added height
   * @returns Whether it overflows
   */
  isOverflow(height: number) {
    return this.#accumolatedHeight + height > this.#height;
  }

  isOverflowTest(height: number) {
    // Optimize the unified algorithm for height difference
    const cha = this.#accumolatedHeight + height - this.#height;
    return this.#accumolatedHeight + height > this.#height && cha >= this.#paragraphDefaultHeight;
  }

  /**
   * Add height
   * @param height Added height
   */
  addHeight(height: number) {
    this.#accumolatedHeight += height;
  }

  /**
   * Set the split point
   * @param pos Split point position
   * @param depth Split point depth
   */
  setBoundary(pos: number, depth: number) {
    this.#pageBoundary = {
      pos,
      depth,
    };
  }

  /**
   * Get the split point
   * @returns Split point
   */
  pageBoundary() {
    return this.#pageBoundary;
  }

  /**
   * Resolve the split point
   * @param pos Split point position
   * @returns Resolution result
   */
  splitResolve(pos: number) {
    // @ts-ignore
    const array = this.#doc.resolve(pos).path;
    const chunks: (number | Node)[][] = [];
    // console.log('array', array);
    if (array.length <= 3) return array;
    const size = 3;
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Get the last page
   * @returns Last page
   */
  lastPage() {
    return this.#doc.lastChild;
  }
}
let splitCount = 0;
let splitCount1 = 0;
/*
 * PageComputedContext pagination core calculation class
 */
export class PageComputedContext {
  nodesComputed: NodesComputed;
  state: EditorState;
  tr: Transaction;
  pageState: PageState;
  editor: Editor;
  constructor(editor: Editor, nodesComputed: NodesComputed, pageState: PageState, state: EditorState) {
    this.editor = editor;
    this.nodesComputed = nodesComputed;
    this.tr = state.tr;
    this.state = state;
    this.pageState = pageState;
  }

  // Core execution logic
  run() {
    const { selection, doc } = this.state;
    const { inserting, deleting, splitPage }: PageState = this.pageState;
    this.removeElementsWithDuplicateId();
    if (splitPage) return this.initComputed();
    if (!inserting && deleting && selection.$head.node(1) === doc.lastChild && !this.tr.steps.length) return this.tr;
    if (inserting || deleting) {
      this.computed();
      this.checkNodeAndFix();
    }
    return this.tr;
  }

  removeElementsWithDuplicateId() {
    const tr = this.tr;
    const { doc } = tr;
    const idMap = new Map<string, { node: Node; pos: number }>();
    const operations: ({ operation: 'delete'; from: number; to: number } | { operation: 'change-id'; from: number })[] = [];
    doc.descendants((node: Node, pos: number) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const id = node.attrs.id as string;
      if (!id || node.type.name === 'text') return false;
      if (idMap.has(id)) {
        const oldNodeData = idMap.get(id)!;
        const newNodeData = { node, pos };
        const deleteNode = oldNodeData.node.nodeSize > newNodeData.node.nodeSize ? oldNodeData : newNodeData;
        const preseveNode = oldNodeData.node.nodeSize > newNodeData.node.nodeSize ? newNodeData : oldNodeData;
        if (preseveNode.node.textContent.includes(deleteNode.node.textContent) && deleteNode.node.children.length > 0)
          operations.push({
            operation: 'delete',
            from: deleteNode.pos + 1,
            to: deleteNode.pos + deleteNode.node.nodeSize + 1,
          });
        else operations.push({ operation: 'change-id', from: deleteNode.pos });
        idMap.set(id, preseveNode);
        return false;
      } else idMap.set(id, { node, pos });
    });
    operations.sort((a, b) => a.from - b.from);
    operations.forEach((pos) => {
      if (pos.operation === 'delete') {
        const from = tr.mapping.map(pos.from);
        const to = tr.mapping.map(pos.to);
        tr.deleteRange(from, to);
      } else if (pos.operation === 'change-id') {
        const from = tr.mapping.map(pos.from);
        const id = getId();
        tr.setNodeAttribute(from, 'id', id);
      }
    });
    this.tr = tr;
  }

  computed() {
    const tr = this.tr;
    const { selection } = this.state;
    //@ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const startNumber = tr.doc.content.findIndex(selection.from).index + 1;
    //@ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const curNunmber = tr.doc.content.findIndex(selection.head).index + 1;

    if (tr.doc.childCount > 1 && (tr.doc.content.childCount !== curNunmber || curNunmber !== startNumber)) {
      this.mergeDocument();
    }
    splitCount1 = 0;
    splitCount = 0;
    this.splitDocument();
    return this.tr;
  }

  /**
   * Initialize pagination when the document starts loading
   */
  initComputed() {
    splitCount1 = 0;
    splitCount = 0;
    // console.log('Initial pagination on first load');
    this.mergeDefaultDocument(1);
    this.splitDocument();
    // console.log('Pagination on first load completed');
    return this.tr;
  }

  /**
   * Recursively split pages
   */
  splitDocument() {
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
   * @param count
   */
  mergeDefaultDocument(count: number) {
    const tr = this.tr;
    // Merge all pages into one page
    while (tr.doc.content.childCount > count) {
      const nodesize = tr.doc.content.lastChild ? tr.doc.content.lastChild.nodeSize : 0;
      let depth = 1;
      // If the last node of the previous page and the node of the next page are of the same type, merge them
      if (tr.doc.content.lastChild != tr.doc.content.firstChild) {
        // Get the second last page
        const prePage = tr.doc.content.child(tr.doc.content.childCount - 2);
        // Get the last page
        const lastPage = tr.doc.content.lastChild;
        // If the first child tag of the last page and the last child tag of the previous page are of the same type or are extended types (split types of the main type), the depth is 2 when merging
        if (lastPage?.firstChild?.type == prePage?.lastChild?.type && lastPage?.firstChild?.attrs?.extend) {
          depth = 2;
        }
      }
      tr.join(tr.doc.content.size - nodesize, depth);
    }
    this.tr = tr;
  }

  /**
   * Merge remaining documents and paginate the remaining documents
   * Depth judgment: If the first child tag of the remaining page is an extended type (split type of the main type), the depth is 2 when merging
   * If the first tag is not an extended type, the depth is 1
   */
  mergeDocument() {
    const tr = this.tr;
    const { selection } = this.state;
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unnecessary-type-assertion
    const count = (tr.doc.content.findIndex(selection.head).index + 1) as number;
    // Merge all pages into one page
    // console.log('Merging from the ' + count + 'th page');
    this.mergeDefaultDocument(count);
  }

  /**
   * Pagination main logic, modify the system tr split method, add default extend judgment, regenerate default id
   * @param pos
   * @param depth
   * @param typesAfter
   * @param schema
   */
  splitPage({ pos, depth = 1, typesAfter, schema }: SplitParams) {
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

      // Handle id duplication issue
      if (na?.attrs.id) {
        let extend = {};
        if (na.attrs.extend == false) {
          extend = { extend: true };
        }
        // Regenerate id
        const attr = Object.assign({}, n.attrs, { id: getId(), ...extend });
        na = schema.nodes[n.type.name]?.createAndFill(attr, after);
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
  checkNodeAndFix() {
    let tr = this.tr;
    const { doc } = tr;
    const { schema } = this.state;
    let beforeBolck: Node | null = null;
    let beforePos = 0;
    doc.descendants((node: Node, pos: number, parentNode: Node | null, i) => {
      if (node.type === schema.nodes[PARAGRAPH] && node.attrs.extend == true) {
        if (beforeBolck == null) {
          beforeBolck = node;
          beforePos = pos;
        } else {
          // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
          const mappedPos = tr.mapping.map(pos);
          if (beforeBolck.type !== schema.nodes[PARAGRAPH]) {
            tr = tr.step(new ReplaceStep(mappedPos - 1, mappedPos + 1, Slice.empty));
          }
          return false;
        }
      }
      // if (
      //   node.type === schema.nodes[PAGE] &&
      //   node.children.every((child) => child.type.name == PARAGRAPH && child.children.length == 0) &&
      //   node.childCount !== 1
      // ) {
      //   const mappedPos = tr.mapping.map(pos);
      //   tr = tr.deleteRange(mappedPos - 1, mappedPos - 1 + node.nodeSize - 1);
      //   return false;
      // }
    });
    this.tr = tr;
    return this.tr;
  }

  /**
   * Get the point that needs pagination and return it
   */
  getNodeHeight(): SplitInfo | null {
    const doc = this.tr.doc;
    const { bodyOptions } = this.pageState;
    const splitContex = new SplitContext(this.state.schema, doc, getBodyHeight(bodyOptions), getDefault());
    const nodesComputed = this.nodesComputed;
    const lastNode = doc.lastChild;
    doc.descendants((node: Node, pos: number, parentNode: Node | null, i) => {
      if (lastNode != node && parentNode?.type.name == 'doc') {
        return false;
      }
      if (!splitContex.pageBoundary()) {
        let dom = document.querySelector(`[data-id="${node.attrs.id}"]`);
        if (!dom && node.type.name != PAGE) dom = getAbsentHtmlH(node, this.state.schema) ?? null;
        //@ts-ignore
        return nodesComputed[node.type.name](splitContex, node, pos, parentNode, dom!);
      }
      return false;
    });
    return splitContex.pageBoundary() ? splitContex.pageBoundary() : null;
  }
}
