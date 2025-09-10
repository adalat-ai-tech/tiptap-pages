'use client';
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { DOMSerializer, type Mark, Node, type Schema } from '@tiptap/pm/model';
import { type JSONContent } from '@tiptap/core';
import { createHTMLDocument, type VHTMLDocument } from 'zeed-dom';
import { type SplitContext } from './computed';
import { type PageOptions } from './types';

import { getId } from './utils/node';

 
export const getBodyHeight = (options: PageOptions): number => {
  const { pageLayout, pageNumber } = options;
  

  const headerHeight = pageNumber?.show && pageNumber?.position === 'top' 
    ? (options.headerHeight ?? 30)
    : 0;
    
  const footerHeight = pageNumber?.show && pageNumber?.position === 'bottom' 
    ? (options.footerHeight ?? 30)
    : 0;
  

  const marginHeight = pageLayout?.margins 
    ? (pageLayout.margins.top.value + pageLayout.margins.bottom.value) * 96
    : 96; 
  
  return options.bodyHeight - marginHeight - (headerHeight + footerHeight);
};


export const getBodyWidth = (options: PageOptions): number => {
  const { pageLayout } = options;
  

  const marginWidth = pageLayout?.margins 
    ? (pageLayout.margins.left.value + pageLayout.margins.right.value) * 96
    : 96; 
  
  return options.bodyWidth - marginWidth;
};


export function getHTMLFromFragment(
  doc: Node, 
  schema: Schema, 
  options?: { document?: Document }
): string {
  if (options?.document) {

    const wrap = options.document.createElement('div');
    DOMSerializer.fromSchema(schema).serializeFragment(
      doc.content, 
      { document: options.document }, 
      wrap
    );
    return wrap.innerHTML;
  }


  const zeedDocument = DOMSerializer.fromSchema(schema).serializeFragment(
    doc.content, 
    { document: createHTMLDocument() as unknown as Document }
  ) as unknown as VHTMLDocument;

  return zeedDocument.render();
}


export function getFlag(cnode: Node, schema: Schema): boolean | null {
   
  const paragraphDOM = document.querySelector("[data-id='" + cnode.attrs.id + "']") || 
    iframeDoc?.querySelector("[data-id='" + cnode.attrs.id + "']");
    
  if (!paragraphDOM) return null;
  
  const width = paragraphDOM.getBoundingClientRect().width;
  const html = generateHTML(getJsonFromDoc(cnode), schema);
  const { width: wordWidth } = computedWidth(html, false);
  

  if (width >= wordWidth) {
    return false;
  }
  
  let strLength = 0;
  cnode.descendants((node: Node) => {

    if (node.isText) {
      const nodeText = node.text;
      if (nodeText) {
        for (let i = 0; i < nodeText.length; i++) {
          const { width: charWidth } = computedWidth(nodeText.charAt(i));
          if (strLength + charWidth > width) {
            strLength = charWidth;
          } else {
            strLength += charWidth;
          }
        }
      }
    } else {
      const html = generateHTML(getJsonFromDoc(node), schema);
      const { width: nodeWidth } = computedWidth(html);
      if (strLength + nodeWidth > width) {
        strLength = nodeWidth;
      } else {
        strLength += nodeWidth;
      }
    }
  });
  
  const fontSize = parseFloat(window.getComputedStyle(paragraphDOM).getPropertyValue('font-size'));
  return Math.abs(strLength - width) < fontSize;
}


const htmlCache = new Map<string, string>();

export function generateHTML(doc: JSONContent, schema: Schema): string {
  const cacheKey = JSON.stringify(doc);
  
  if (htmlCache.has(cacheKey)) {
    return htmlCache.get(cacheKey)!;
  }
  
  const contentNode = Node.fromJSON(schema, doc);
  const html = getHTMLFromFragment(contentNode, schema);
  htmlCache.set(cacheKey, html);
  
  return html;
}


function createAndCalculateHeight(node: Node, content: Node[], splitContext: SplitContext): number {
  const calculateNode = node.type.create(node.attrs, content, node.marks);
  const htmlNode = generateHTML(getJsonFromDoc(calculateNode), splitContext.schema);
  const htmlNodeHeight = computedHeight(htmlNode, node.attrs.id as string);
  
  return htmlNodeHeight;
}


function calculateNodeOverflowHeightAndPoint(node: Node, dom: HTMLElement, splitContext: SplitContext): number {
  let height = splitContext.getAccumulatedHeight() === 0 
    ? splitContext.getHeight() 
    : splitContext.getHeight() - splitContext.getAccumulatedHeight();
    
  height -= parseFloat(window.getComputedStyle(dom).getPropertyValue('margin-bottom'));
  
  if (dom.parentElement?.firstChild === dom) {
    height -= parseFloat(window.getComputedStyle(dom).getPropertyValue('margin-top'));
  }
  
  let lastChild = node.lastChild;
  const childCount = node.childCount;
  
  let point: { i?: number; calculateLength?: number } = {};
  
  const content: Node[] = [...(node.content?.content ?? [])];
  
  for (let i = childCount - 1; i >= 0; i--) {
    lastChild = content[i]!;
    
    if (lastChild?.isText) {
      const text = lastChild.text ?? '';
      const breakIndex = binarySearchTextBreak(
        text, 
        node, 
        i, 
        content, 
        height, 
        splitContext, 
        lastChild.marks
      );

      if (breakIndex > 0) {
        const partialText = text.slice(0, breakIndex);
        const htmlNodeHeight = createAndCalculateHeight(
          node, 
          [...content.slice(0, i), splitContext.schema.text(partialText, lastChild.marks)], 
          splitContext
        );
        
        point = { i, calculateLength: breakIndex };
        content[i] = splitContext.schema.text(partialText, lastChild.marks);
        
        if (height > htmlNodeHeight) break;
      }
    } else {
      const htmlNodeHeight = createAndCalculateHeight(
        node, 
        [...content.slice(0, i), lastChild], 
        splitContext
      );
      
      if (height > htmlNodeHeight) {
        point = { i, calculateLength: 0 };
        break;
      }
    }
  }
  
  let isFlag = true;
  let index = 0;
  
  node.descendants((_node: Node, pos: number, _: Node | null, i: number) => {
    if (!isFlag) {
      return isFlag;
    }
    
    if (i === point.i) {
       
      index = pos + (point.calculateLength !== undefined ? point.calculateLength : 0) + 1;
      isFlag = false;
    }
  });
  
  return index;
}


function binarySearchTextBreak(
  fullText: string,
  node: Node,
  indexInContent: number,
  content: Node[],
  heightLimit: number,
  splitContext: SplitContext,
  marks: readonly Mark[]
): number {
  let low = 1;
  let high = fullText.length;
  let validBreak = 0;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    
    let candidate = fullText.slice(0, mid);
    let lastSpaceIndex = candidate.lastIndexOf(' ');
    
    if (lastSpaceIndex < 0) {
      if (candidate.length > 7) {
        lastSpaceIndex = candidate.length;
      } else {
        return 0;
      }
    }
    
    candidate = candidate.slice(0, lastSpaceIndex);

    if (candidate.length === 0) {
      if (mid > 1) {
        candidate = fullText.slice(0, 1);
      } else {
        return 0;
      }
    }

    const candidateHeight = createAndCalculateHeight(
      node,
      [...content.slice(0, indexInContent), splitContext.schema.text(candidate, marks)],
      splitContext
    );
    
    if (candidateHeight <= heightLimit) {
      validBreak = lastSpaceIndex > 0 ? lastSpaceIndex : candidate.length;
      low = mid + 1; 
    } else {
      high = mid - 1; 
    }
  }

  return validBreak;
}



export function getBreakPos(cnode: Node, dom: HTMLElement, splitContext: SplitContext): number | null {
   
  // @ts-ignore
  const paragraphDOM = dom;
  
  if (!paragraphDOM) return null;
  
  const width = paragraphDOM.offsetWidth;
  const html = generateHTML(getJsonFromDoc(cnode), splitContext.schema);
  const { width: wordWidth } = computedWidth(html, false);

  if (width >= wordWidth) {
    return null;
  }

  const index = calculateNodeOverflowHeightAndPoint(cnode, dom, splitContext);
  return index || null;
}


export function getJsonFromDoc(node: Node): JSONContent {
  return {
    type: 'doc',
    content: [node.toJSON()],
  };
}


export function getJsonFromDocForJson(json: JSONContent): JSONContent {
  return {
    type: 'doc',
    content: [json],
  };
}


let iframeComputed: HTMLIFrameElement | null = null;
let iframeDoc: Document | null | undefined = null;


export function getBlockHeight(node: Node): number {
  const paragraphDOM = document.querySelector("[data-id='" + node.attrs.id + "']")!;
  
  if (paragraphDOM) {
    return (paragraphDOM as HTMLElement).offsetHeight;
  }
  
  return 0;
}


function findTextblockHacksIds(node: Node): string[] {
  const ids: string[] = [];
  
  node.descendants((node) => {
    if (node.isTextblock && node.childCount === 0) {
      ids.push(node.attrs.id as string);
    }
  });
  
  return ids;
}


export class UnitConversion {
  private arrDPI: unknown[] = [];

  constructor() {
    const arr: unknown[] = [];
    
    if (typeof window === 'undefined') return;

     
    // @ts-ignore
    if (window.screen.deviceXDPI) {
       
      // @ts-ignore
      arr.push(window.screen.deviceXDPI);
       
      // @ts-ignore
      arr.push(window.screen.deviceYDPI);
    } else {
      const tmpNode: HTMLElement = document.createElement('DIV');
      tmpNode.style.cssText = 'width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:-99;visibility:hidden';
      document.body.appendChild(tmpNode);
      arr.push(tmpNode.offsetWidth);
      arr.push(tmpNode.offsetHeight);
      
      if (tmpNode?.parentNode) {
        tmpNode.parentNode.removeChild(tmpNode);
      }
    }
    
    this.arrDPI = arr;
  }


  pxConversionMm(value: number): number {
    // @ts-ignore
    const inch = value / this.arrDPI[0];
    const mmValue = inch * 25.4;
    return Number(mmValue.toFixed());
  }


  mmConversionPx(value: number): number {
    const inch = value / 25.4;
    // @ts-ignore
    const pxValue = inch * this.arrDPI[0];
    return Number(pxValue.toFixed());
  }


  ptConversionPx(value: number): number {
    return (value * 96) / 72;
  }


  pxConversionPt(value: number): number {
    return (value * 72) / 96;
  }
}

  
const dimensionCache = new Map<string, { height: number; width: number }>();

const valueCache = new Map<string, number>();


export function computedHeight(html: string, id: string): number {
  const computeddiv = iframeDoc?.getElementById('computeddiv');
  
   
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


export function computedWidth(html: string, cache = true): { height: number; width: number } {
  if (dimensionCache.has(html)) {
    return dimensionCache.get(html) as { height: number; width: number };
  }
  
  const computedspan = iframeDoc?.getElementById('computedspan');
  
  if (html === ' ') {
    html = '&nbsp;';
  }
  
  if (computedspan) {
    computedspan.innerHTML = html;
    const computedStyle = window.getComputedStyle(computedspan);
    const width = computedspan.getBoundingClientRect().width;
    const height = computedspan.getBoundingClientRect().height + 
      parseFloat(computedStyle.marginTop) + 
      parseFloat(computedStyle.marginBottom);
    
    if (cache) {
      dimensionCache.set(html, { height, width });
    }
    
    computedspan.innerHTML = '&nbsp;';
    return { height, width };
  }
  
  return { height: 0, width: 0 };
}


export function getContentSpacing(dom: HTMLElement): number {
  const content = dom.querySelector('.content');
  
  if (dom && content) {
     
    // @ts-ignore
    const contentStyle = window.getComputedStyle(content);
    const paddingTop = contentStyle.getPropertyValue('padding-top');
    const paddingBottom = contentStyle.getPropertyValue('padding-bottom');
    const marginTop = contentStyle.getPropertyValue('margin-top');
    const marginBottom = contentStyle.getPropertyValue('margin-bottom');
    
    const padding = parseFloat(paddingTop) + parseFloat(paddingBottom);
    const margin = parseFloat(marginTop) + parseFloat(marginBottom);
    
     
    // @ts-ignore
    return padding + margin + (dom.offsetHeight - content.offsetHeight);
  }
  
  return 0;
}

/**
 * Get spacing for a DOM element
 * @param dom - The DOM element to measure
 * @returns Total spacing in pixels
 */
export function getSpacing(dom: HTMLElement): number {
   
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

/**
 * Get default height from cache or calculate it
 * @returns Default height in pixels
 */
export function getDefault(): number {
  if (valueCache.has('defaultheight')) {
    return valueCache.get('defaultheight')!;
  }
  
  const computedspan = iframeDoc?.getElementById('computedspan');
   
  // @ts-ignore
  const defaultHeight = getDomHeight(computedspan);
  
  valueCache.set('defaultheight', defaultHeight);
  
  return defaultHeight;
}

/**
 * Get padding, margin, and border for a DOM element
 * @param dom - The DOM element to measure
 * @returns Total spacing including borders in pixels
 */
export function getDomPaddingAndMargin(dom: HTMLElement): number {
  const contentStyle = window.getComputedStyle(dom) || 
    iframeComputed?.contentWindow?.getComputedStyle(dom);
    
  const paddingTop = contentStyle.getPropertyValue('padding-top');
  const paddingBottom = contentStyle.getPropertyValue('padding-bottom');
  const marginTop = contentStyle.getPropertyValue('margin-top');
  const marginBottom = contentStyle.getPropertyValue('margin-bottom');
  
  const padding = parseFloat(paddingTop) + parseFloat(paddingBottom);
  const margin = parseFloat(marginTop) + parseFloat(marginBottom);
  const border = parseFloat(contentStyle.borderWidth);
  
  return padding + margin + border;
}

/**
 * Get the total height of a DOM element including margins and padding
 * @param dom - The DOM element to measure
 * @returns Total height in pixels
 */
export function getDomHeight(dom: HTMLElement): number {
  const contentStyle = window.getComputedStyle(dom) || 
    iframeComputed?.contentWindow?.getComputedStyle(dom);
    
  const nextSiblingStyle = dom.nextElementSibling
    ? window.getComputedStyle(dom.nextElementSibling) || 
      iframeComputed?.contentWindow?.getComputedStyle(dom.nextElementSibling)
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


export function getAbsentHtmlH(node: Node, schema: Schema): HTMLElement | null {
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
  
  const nodeElement = iframeDoc?.querySelector("[data-id='" + node.attrs.id + "']");
  return nodeElement as HTMLElement | null;
}


export function removeAbsentHtmlH(): void {
  const computeddiv = iframeDoc?.getElementById('computeddiv');
   
  // @ts-ignore
  computeddiv.innerHTML = '';
}


function iframeDocAddP(): void {
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


function iframeDocAddDiv(options: PageOptions): void {
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


export function removeComputedHtml(): void {
  const iframeComputed1 = document.getElementById('computediframe');
  
  if (iframeComputed1) {
    document.body.removeChild(iframeComputed1);
    iframeComputed = null;
    iframeDoc = null;
  }
}


export function buildComputedHtml(options: PageOptions): void {
  removeComputedHtml();
  
  iframeComputed = document.createElement('iframe');
  document.body.appendChild(iframeComputed);
  
  // Get the document object
   
  iframeDoc = iframeComputed?.contentDocument || iframeComputed?.contentWindow?.document;
  
  iframeComputed?.setAttribute('id', 'computediframe');
  iframeComputed?.setAttribute(
    'style', 
    'width: 100%;height: 100%; position: absolute; top:-4003px; left:-4003px; z-index: -89;'
  );
  
  if (!iframeDoc) return;
  
  copyStylesToIframe(iframeDoc);
  iframeDocAddP();
  iframeDocAddDiv(options);
}


function copyStylesToIframe(iframeContentDoc: Document): void {

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
    const newStyle = iframeContentDoc.createElement('style');
    newStyle.textContent = style.textContent;
    iframeContentDoc.head.appendChild(newStyle);
  });
  

  const elementsWithInlineStyles = document.querySelectorAll('[style]');
  for (const element of elementsWithInlineStyles) {
    const styleAttr = element.getAttribute('style');
    const clonedElement = iframeContentDoc.createElement(element.tagName);
    clonedElement.setAttribute('style', styleAttr!);

  }
  
  iframeDoc?.body.classList.add('prose', 'prose-base');
}
