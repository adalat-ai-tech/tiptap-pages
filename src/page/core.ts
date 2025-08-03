'use client';
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { DOMSerializer, type Mark, Node, type Schema } from '@tiptap/pm/model';
import { type JSONContent } from '@tiptap/core';
import { createHTMLDocument, type VHTMLDocument } from 'zeed-dom';
import { type SplitContext } from './computed';
import { type PageOptions } from './types';
import { getId } from '../utils/node';

export const getBodyHeight = (options: PageOptions) => {
  const headerHeight = options.headerHeight || 0;
  const footerHeight = options.footerHeight || 0;
  return options.bodyHeight - headerHeight - footerHeight;
};

export const getBodyWidth = (options: PageOptions) => {
  return options.bodyWidth;
};

/**
 * Generate HTML from schema doc
 * @param doc - The document node
 * @param schema - The schema to use
 * @param options - Optional parameters
 */
export function getHTMLFromFragment(doc: Node, schema: Schema, options?: { document?: Document }): string {
  if (options?.document) {
    // The caller is relying on their own document implementation. Use this
    // instead of the default zeed-dom.
    const wrap = options.document.createElement('div');

    DOMSerializer.fromSchema(schema).serializeFragment(doc.content, { document: options.document }, wrap);
    return wrap.innerHTML;
  }

  // Use zeed-dom for serialization.
  const zeedDocument = DOMSerializer.fromSchema(schema).serializeFragment(doc.content, {
    document: createHTMLDocument() as unknown as Document,
  }) as unknown as VHTMLDocument;

  return zeedDocument.render();
}

/**
 * Calculate if the last line is filled
 * @param cnode
 */
export function getFlag(cnode: Node, schema: Schema) {
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const paragraphDOM = document.querySelector("[data-id='" + cnode.attrs.id + "']") || iframeDoc?.querySelector("[data-id='" + cnode.attrs.id + "']");
  if (!paragraphDOM) return null;
  const width = paragraphDOM.getBoundingClientRect().width;
  const html = generateHTML(getJsonFromDoc(cnode), schema);
  const { width: wordl } = computedWidth(html, false);
  // If the line is not filled, it should be merged
  if (width >= wordl) {
    return false;
  }
  let strLength = 0;
  cnode.descendants((node: Node, pos: number, _: Node | null, _i: number) => {
    // TODO: Text calculation is low performance, need to use binary search to improve performance
    if (node.isText) {
      const nodeText = node.text;
      if (nodeText) {
        for (let i = 0; i < nodeText.length; i++) {
          const { width: wl } = computedWidth(nodeText.charAt(i));
          if (strLength + wl > width) {
            strLength = wl;
          } else {
            strLength += wl;
          }
        }
      }
    } else {
      const html = generateHTML(getJsonFromDoc(node), schema);
      const { width: wordl } = computedWidth(html);
      if (strLength + wordl > width) {
        strLength = wordl;
      } else {
        strLength += wordl;
      }
    }
  });
  const space = parseFloat(window.getComputedStyle(paragraphDOM).getPropertyValue('font-size'));
  return Math.abs(strLength - width) < space;
}

/**
 * Generates an HTML string from a given JSON content and schema.
 *
 * @param doc - The JSON content to be converted to HTML.
 * @param schema - The schema used to interpret the JSON content.
 * @returns The generated HTML string.
 */
const htmlCache = new Map<string, string>();

export function generateHTML(doc: JSONContent, schema: Schema): string {
  const cacheKey = JSON.stringify(doc);
  if (htmlCache.has(cacheKey)) return htmlCache.get(cacheKey)!;
  const contentNode = Node.fromJSON(schema, doc);
  const html = getHTMLFromFragment(contentNode, schema);
  htmlCache.set(cacheKey, html);
  return html;
}

/**
 * Creates a new node with the given content and calculates its height.
 *
 * @param node - The original node to be used as a template.
 * @param content - An array of nodes to be used as the content of the new node.
 * @param splitContex - The context containing the schema used for generating HTML.
 * @returns The calculated height of the generated HTML node.
 */
function createAndCalculateHeight(node: Node, content: Node[], splitContex: SplitContext) {
  const calculateNode = node.type.create(node.attrs, content, node.marks);
  const htmlNode = generateHTML(getJsonFromDoc(calculateNode), splitContex.schema);
  const htmlNodeHeight = computedHeight(htmlNode, node.attrs.id as string);
  return htmlNodeHeight;
}

/*
 * Calculates the overflow height and point of a given node within a DOM element.
 *
 * @param node - The node to calculate overflow for.
 * @param dom - The DOM element containing the node.
 * @param splitContex - The context used for splitting nodes.
 * @returns The index at which the node overflows.
 */
function calculateNodeOverflowHeightAndPoint(node: Node, dom: HTMLElement, splitContex: SplitContext) {
  // Get the current height of the dom
  let height = splitContex.getAccumulatedHeight() === 0 ? splitContex.getHeight() : splitContex.getHeight() - splitContex.getAccumulatedHeight();
  height -= parseFloat(window.getComputedStyle(dom).getPropertyValue('margin-bottom'));
  if (dom.parentElement?.firstChild === dom) height -= parseFloat(window.getComputedStyle(dom).getPropertyValue('margin-top'));
  // Get the last child node
  let lastChild = node.lastChild;
  // Get the number of child nodes to be calculated
  const childCount = node.childCount;
  // The final calculated point
  let point: { i?: number; calculateLength?: number } = {};
  // Get all the nodes and traverse them in reverse order
  const content: Node[] = [...(node.content?.content ?? [])];
  // Traverse the content in reverse order
  for (let i = childCount - 1; i >= 0; i--) {
    lastChild = content[i]!;
    // If this is a text node, apply binary search:
    if (lastChild?.isText) {
      const text = lastChild.text ?? '';
      let htmlNodeHeight = 0;

      const breakIndex = binarySearchTextBreak(text, node, i, content, height, splitContex, lastChild.marks);

      // If breakIndex > 0, we found a valid break:
      if (breakIndex > 0) {
        const partialText = text.slice(0, breakIndex);
        htmlNodeHeight = createAndCalculateHeight(node, [...content.slice(0, i), splitContex.schema.text(partialText, lastChild.marks)], splitContex);
        point = { i, calculateLength: breakIndex };
        content[i] = splitContex.schema.text(partialText, lastChild.marks);
        if (height > htmlNodeHeight) break;
      }
    } else {
      const htmlNodeHeight = createAndCalculateHeight(node, [...content.slice(0, i), lastChild], splitContex);
      if (height > htmlNodeHeight) {
        point = { i, calculateLength: 0 };
        break;
      }
    }
  }
  let isFlag = true;
  let index = 0;
  node.descendants((node: Node, pos: number, _: Node | null, i: number) => {
    if (!isFlag) {
      return isFlag;
    }
    if (i == point.i) {
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      index = pos + (point.calculateLength !== undefined ? point.calculateLength : 0) + 1;
      isFlag = false;
    }
  });
  return index;
}

/**
 * Uses binary search to find the largest text slice that fits in heightLimit.
 * Preserves word boundaries by trimming to the last space within the candidate.
 */
function binarySearchTextBreak(
  fullText: string,
  node: Node,
  indexInContent: number,
  content: Node[],
  heightLimit: number,
  splitContex: SplitContext,
  marks: readonly Mark[]
): number {
  let low = 1;
  let high = fullText.length;
  let validBreak = 0;

  let iterationCount = 0;

  while (low <= high) {
    iterationCount++;
    const mid = Math.floor((low + high) / 2);
    // Slice to mid and trim back to the last space:
    let candidate = fullText.slice(0, mid);
    let lastSpaceIndex = candidate.lastIndexOf(' ');
    if (lastSpaceIndex < 0) {
      if (candidate.length > 7) lastSpaceIndex = candidate.length;
      else return 0;
    }
    candidate = candidate.slice(0, lastSpaceIndex);

    const candidateHeight = createAndCalculateHeight(
      node,
      [...content.slice(0, indexInContent), splitContex.schema.text(candidate, marks)],
      splitContex
    );
    if (candidateHeight <= heightLimit) {
      validBreak = lastSpaceIndex;
      low = mid + 1; // Try bigger
    } else {
      high = mid - 1; // Too large
    }
  }

  return validBreak;
}

/**
 * Get the last break position in a paragraph that needs pagination.
 * If the width of inline Chinese and English characters exceeds the paragraph width, calculate the break position.
 * If not exceeded, return null directly.
 * Since there may be images inline, images do not need to be calculated.
 * @param cnode - The node representing the paragraph.
 * @param dom - The DOM element of the paragraph.
 * @param splitContex - The context containing the schema used for generating HTML.
 */
export function getBreakPos(cnode: Node, dom: HTMLElement, splitContex: SplitContext) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const paragraphDOM = dom;
  if (!paragraphDOM) return null;
  const width = paragraphDOM.offsetWidth;

  const html = generateHTML(getJsonFromDoc(cnode), splitContex.schema);
  const { width: wordl } = computedWidth(html, false);
  // If the height exceeds the default but the width does not, it means there is only one line with inline elements like images.
  if (width >= wordl) {
    return null;
  }

  const index = calculateNodeOverflowHeightAndPoint(cnode, dom, splitContex);
  return index ? index : null;
}

/**
 * Utility function to get JSON from a document node.
 * @param node - The document node.
 */
export function getJsonFromDoc(node: Node) {
  return {
    type: 'doc',
    content: [node.toJSON()],
  };
}

export function getJsonFromDocForJson(json: JSONContent) {
  return {
    type: 'doc',
    content: [json],
  };
}

let iframeComputed: HTMLIFrameElement | null = null;
let iframeDoc: Document | null | undefined = null;

/**
 * Get the height of a block node by its ID.
 * @param node - The node representing the block.
 * @returns The height of the block node.
 */
export function getBlockHeight(node: Node): number {
  const paragraphDOM = document.querySelector("[data-id='" + node.attrs.id + "']")!;
  if (paragraphDOM) return (paragraphDOM as HTMLElement).offsetHeight;
  return 0;
}
function findTextblockHacksIds(node: Node) {
  const ids: string[] = [];
  node.descendants((node) => {
    if (node.isTextblock && node.childCount == 0) {
      ids.push(node.attrs.id as string);
    }
  });
  return ids;
}
export class UnitConversion {
  arrDPI: unknown[] = [];

  constructor() {
    const arr: unknown[] = [];
    if (typeof window === 'undefined') return;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (window.screen.deviceXDPI) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      arr.push(window.screen.deviceXDPI);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      arr.push(window.screen.deviceYDPI);
    } else {
      const tmpNode: HTMLElement = document.createElement('DIV');
      tmpNode.style.cssText = 'width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:-99;visibility:hidden';
      document.body.appendChild(tmpNode);
      arr.push(tmpNode.offsetWidth);
      arr.push(tmpNode.offsetHeight);
      if (tmpNode?.parentNode) tmpNode.parentNode.removeChild(tmpNode);
    }
    this.arrDPI = arr;
  }

  /**
   * @description Convert px to mm
   * @param value - The value in px
   */
  pxConversionMm(value: number): number {
    //@ts-ignore
    const inch = value / this.arrDPI[0];
    const c_value = inch * 25.4;
    return Number(c_value.toFixed());
  }

  /**
   * @description Convert mm to px
   * @param value - The value in mm
   */
  mmConversionPx(value: number) {
    const inch = value / 25.4;
    //@ts-ignore
    const c_value = inch * this.arrDPI[0];
    return Number(c_value.toFixed());
  }

  /**
   * @description Convert pt to px
   * @param value - The value in pt
   */
  ptConversionPx(value: number) {
    return (value * 96) / 72;
  }

  /**
   * @description Convert px to pt
   * @param value - The value in px
   */
  pxConversionPt(value: number) {
    return (value * 72) / 96;
  }
}

const map = new Map();

/**
 * Computes the height of an HTML element within an iframe document.
 *
 * This function sets the inner HTML of a temporary div element with the provided HTML content,
 * retrieves the height of the specified element by its ID, and then resets the temporary div's content.
 *
 * @param html - The HTML content to be inserted into the temporary div.
 * @param id - The ID of the HTML element whose height is to be computed.
 * @returns The height of the specified HTML element in pixels. Returns 0 if the temporary div is not found.
 */
export function computedHeight(html: string, id: string) {
  const computeddiv = iframeDoc?.getElementById('computeddiv');
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (computeddiv) {
    computeddiv.innerHTML = html;
    const htmldiv = iframeDoc?.querySelector("[data-id='" + id + "']");
    if (!htmldiv) return 0;
    const computedStyle = window.getComputedStyle(htmldiv);
    const height = htmldiv.getBoundingClientRect().height + parseFloat(computedStyle.marginTop);
    computeddiv.innerHTML = '&nbsp;';
    return height;
  }
  return 0;
}

export function computedWidth(html: string, cache = true) {
  if (map.has(html)) {
    return map.get(html) as { height: number; width: number };
  }
  const computedspan = iframeDoc?.getElementById('computedspan');
  if (html == ' ') {
    html = '&nbsp;';
  }
  if (computedspan) {
    computedspan.innerHTML = html;
    const computedStyle = window.getComputedStyle(computedspan);
    const width = computedspan.getBoundingClientRect().width;
    const height = computedspan.getBoundingClientRect().height + parseFloat(computedStyle.marginTop) + parseFloat(computedStyle.marginBottom);
    if (cache) {
      map.set(html, { height, width });
    }
    computedspan.innerHTML = '&nbsp;';
    return { height, width };
  }
  return { height: 0, width: 0 };
}

export function getContentSpacing(dom: HTMLElement) {
  const content = dom.querySelector('.content');
  if (dom && content) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const contentStyle = window.getComputedStyle(content);
    const paddingTop = contentStyle.getPropertyValue('padding-top');
    const paddingBottom = contentStyle.getPropertyValue('padding-bottom');
    const marginTop = contentStyle.getPropertyValue('margin-top');
    const marginBottom = contentStyle.getPropertyValue('margin-bottom');
    const padding = parseFloat(paddingTop) + parseFloat(paddingBottom);
    const margin = parseFloat(marginTop) + parseFloat(marginBottom);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return padding + margin + (dom.offsetHeight - content.offsetHeight);
  }
  return 0;
}

export function getSpacing(dom: HTMLElement) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const contentStyle = window.getComputedStyle(dom);
  const paddingTop = contentStyle.getPropertyValue('padding-top');
  const paddingBottom = contentStyle.getPropertyValue('padding-bottom');
  const marginTop = contentStyle.getPropertyValue('margin-top');
  const marginBottom = contentStyle.getPropertyValue('margin-bottom');
  const padding = parseFloat(paddingTop) + parseFloat(paddingBottom);
  const margin = parseFloat(marginTop) + parseFloat(marginBottom);
  return padding + margin;
}

export function getDefault() {
  if (map.has('defaultheight')) {
    return map.get('defaultheight') as number;
  }
  const computedspan = iframeDoc?.getElementById('computedspan');
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const defaultheight = getDomHeight(computedspan);
  map.set('defaultheight', defaultheight);
  return defaultheight;
}

export function getDomPaddingAndMargin(dom: HTMLElement) {
  const contentStyle = window.getComputedStyle(dom) || iframeComputed?.contentWindow?.getComputedStyle(dom);
  const paddingTop = contentStyle.getPropertyValue('padding-top');
  const paddingBottom = contentStyle.getPropertyValue('padding-bottom');
  const marginTop = contentStyle.getPropertyValue('margin-top');
  const marginBottom = contentStyle.getPropertyValue('margin-bottom');
  const padding = parseFloat(paddingTop) + parseFloat(paddingBottom);
  const margin = parseFloat(marginTop) + parseFloat(marginBottom);
  return padding + margin + parseFloat(contentStyle.borderWidth);
}

export function getDomHeight(dom: HTMLElement) {
  const contentStyle = window.getComputedStyle(dom) || iframeComputed?.contentWindow?.getComputedStyle(dom);
  const nextSiblingStyle = dom.nextElementSibling
    ? window.getComputedStyle(dom.nextElementSibling) || iframeComputed?.contentWindow?.getComputedStyle(dom.nextElementSibling)
    : null;
  const paddingTop = contentStyle.getPropertyValue('padding-top');
  const paddingBottom = contentStyle.getPropertyValue('padding-bottom');
  const marginTop = contentStyle.getPropertyValue('margin-top');
  const isFirstChild = dom.parentElement?.firstElementChild === dom;
  const marginBottom = Math.max(
    parseFloat(contentStyle.getPropertyValue('margin-bottom')),
    parseFloat(nextSiblingStyle?.getPropertyValue('margin-top') ?? '0')
  );
  const padding = parseFloat(paddingTop) + parseFloat(paddingBottom);
  const isListItem = dom.tagName === 'LI';
  const margin = isFirstChild || isListItem ? parseFloat(marginTop) + marginBottom : marginBottom;
  return padding + margin + dom.offsetHeight + parseFloat(contentStyle.borderWidth);
}

export function getAbsentHtmlH(node: Node, schema: Schema) {
  if (!node.attrs.id) {
    // @ts-ignore
    node.attrs.id = getId();
  }
  const ids = findTextblockHacksIds(node);
  const html = generateHTML(getJsonFromDoc(node), schema);
  const computeddiv = iframeDoc?.getElementById('computeddiv');
  if (computeddiv) {
    computeddiv.innerHTML = html;
    ids.forEach((id) => {
      const nodeHtml = iframeDoc?.querySelector("[data-id='" + id + "']");
      if (nodeHtml) {
        nodeHtml.innerHTML = "<br class='ProseMirror-trailingBreak'>";
      }
    });
  }
  const nodesom = iframeDoc?.querySelector("[data-id='" + node.attrs.id + "']");
  return nodesom;
}

export function removeAbsentHtmlH() {
  const computeddiv = iframeDoc?.getElementById('computeddiv');
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  computeddiv.innerHTML = '';
}

function iframeDocAddP() {
  const computedspan = iframeDoc?.getElementById('computedspan');
  if (!computedspan) {
    const p = iframeDoc?.createElement('p');
    if (!p) return;
    p.classList.add('text-editor');
    p.setAttribute('id', 'computedspan');
    p.setAttribute('style', 'display: inline-block');
    p.innerHTML = '&nbsp;';
    iframeDoc?.body.append(p);
  }
}

function iframeDocAddDiv(options: PageOptions) {
  const computeddiv = iframeDoc?.getElementById('computeddiv');
  if (!computeddiv) {
    const dom = iframeDoc?.createElement('div');
    if (!dom) return;
    dom.setAttribute('class', 'Page prose prose-base text-text-900 font-arial');
    dom.setAttribute(
      'style',
      'opacity: 0;position: absolute;max-width:' +
        getBodyWidth(options) +
        'px;width:' +
        getBodyWidth(options) +
        'px; padding: 0px !important; overflow-wrap: break-word; line-height: 2;'
    );
    const content = iframeDoc?.createElement('div');
    if (!content) return;
    content.classList.add('PageContent');
    content.setAttribute('style', 'min-height: ' + getBodyHeight(options) + 'px;');
    content.setAttribute('id', 'computeddiv');
    dom.append(content);
    iframeDoc?.body.append(dom);
  }
}

export function removeComputedHtml() {
  const iframeComputed1 = document.getElementById('computediframe');
  if (iframeComputed1) {
    document.body.removeChild(iframeComputed1);
    iframeComputed = null;
    iframeDoc = null;
  }
}

/**
 * Build an auxiliary iframe for calculating HTML and printing HTML
 * @param options
 */
export function buildComputedHtml(options: PageOptions) {
  removeComputedHtml();
  iframeComputed = document.createElement('iframe');
  document.body.appendChild(iframeComputed);
  // Get the document object
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  iframeDoc = iframeComputed?.contentDocument || iframeComputed?.contentWindow?.document;
  iframeComputed?.setAttribute('id', 'computediframe');
  iframeComputed?.setAttribute('style', 'width: 100%;height: 100%; position: absolute; top:-4003px; left:-4003px; z-index: -89;');
  // iframeComputed?.setAttribute("style", "width: 100%;height: 100%;opacity: 0;position: absolute;z-index: -89;margin-left:-2003px;");
  if (!iframeDoc) return;
  copyStylesToIframe(iframeDoc);
  iframeDocAddP();
  iframeDocAddDiv(options);
}

function copyStylesToIframe(iframeContentDoc: Document) {
  // Get all stylesheets from the current page
  const links = document.getElementsByTagName('link');
  for (const link of links) {
    if (link?.rel === 'stylesheet') {
      const newLink = iframeContentDoc.createElement('link');
      newLink.rel = 'stylesheet';
      newLink.type = 'text/css';
      newLink.href = link?.href ?? '';
      iframeContentDoc.head.appendChild(newLink);
    }
  }
  const styles = document.querySelectorAll('style');
  styles.forEach((style) => {
    // Create a new <style> tag
    const newStyle = iframeContentDoc.createElement('style');
    // Copy the style content to the new tag
    newStyle.textContent = style.textContent;
    // Insert the new tag into the <head> of the iframe
    iframeContentDoc.head.appendChild(newStyle);
  });
  const elementsWithInlineStyles = document.querySelectorAll('[style]');
  for (const element of elementsWithInlineStyles) {
    const styleAttr = element.getAttribute('style');
    const clonedElement = iframeContentDoc.createElement(element.tagName);
    clonedElement.setAttribute('style', styleAttr!);
    // This only creates elements with inline styles. Depending on the actual situation, you may need to add them to the iframe's DOM tree.
  }
  iframeDoc?.body.classList.add('prose', 'prose-base');
}
