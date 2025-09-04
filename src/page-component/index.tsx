import { useEffect, type CSSProperties } from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { type NodeViewProps } from '@tiptap/core';
import { type PageOptions } from '../types';
import { PAGE } from '../node-names';
import { emitter } from './events';

/**
 * PageComponent - Renders a document page with header, content, and footer
 * 
 * Features:
 * - Dynamic page dimensions based on settings
 * - Header and footer with page numbering
 * - Responsive margins and spacing
 * - Page number display and positioning
 */
export const PageComponent = ({ editor, node, extension }: NodeViewProps) => {
  const options = extension.options as PageOptions;
  const pageNumber = node.attrs.pageNumber as number;
  const totalPages = editor.$nodes(PAGE)?.toString()?.split(',')?.length ?? 0;
  
  // Calculate header height based on page number settings
  const headerHeight = options.pageNumber?.show && 
    options.pageNumber?.position === 'top' 
    ? (options.headerHeight ?? 30)
    : 0;
  
  // Calculate footer height based on page number settings
  const footerHeight = options.pageNumber?.show && 
    options.pageNumber?.position === 'bottom' 
    ? (options.footerHeight ?? 30)
    : 0;

  // Generate page number label
  const pageNumberLabel = options.pageNumber?.showCount 
    ? `${pageNumber} of ${totalPages}` 
    : pageNumber.toString();

  // Handle page change events
  useEffect(() => {
    const handlePageChange = () => {};
    
    emitter.on('totalPageChange', handlePageChange);
    
    // Emit event if this is the last page
    if (pageNumber === totalPages) {
      emitter.emit('totalPageChange', totalPages);
    }
    
    return () => emitter.off('totalPageChange', handlePageChange);
  }, [totalPages, pageNumber]);

  // Calculate dynamic styles with safe defaults
  const pageStyles: CSSProperties = {
    height: `${options.bodyHeight}px`,
    width: `${options.bodyWidth}px`,
    paddingTop: `${(options.pageLayout?.margins?.top?.value ?? 0.5) * 96}px`,
    paddingBottom: `${(options.pageLayout?.margins?.bottom?.value ?? 0.5) * 96}px`,
    paddingLeft: `${(options.pageLayout?.margins?.left?.value ?? 0.5) * 96}px`,
    paddingRight: `${(options.pageLayout?.margins?.right?.value ?? 0.5) * 96}px`,
  };

  const headerStyles: CSSProperties = {
    height: `${headerHeight}px`,
    width: '100%',
    textAlign: options.pageNumber?.alignment?.toLowerCase() as CSSProperties['textAlign'],
  };

  const footerStyles: CSSProperties = {
    height: `${footerHeight}px`,
    width: '100%',
    textAlign: options.pageNumber?.alignment?.toLowerCase() as CSSProperties['textAlign'],
  };

  const contentStyles: CSSProperties = {
    height: `${options.bodyHeight - footerHeight - headerHeight - 
      ((options.pageLayout?.margins?.top?.value ?? 0.5) + (options.pageLayout?.margins?.bottom?.value ?? 0.5)) * 96}px`,
    width: `${options.bodyWidth - 
      ((options.pageLayout?.margins?.left?.value ?? 0.5) + (options.pageLayout?.margins?.right?.value ?? 0.5)) * 96}px`,
  };

  return (
    <NodeViewWrapper
      onContextMenu={() => false}
      className="Page prose prose-base relative mx-auto my-2 transform rounded-xl border border-grey-150 bg-white shadow-[0px_0px_8px_0px_rgba(32,33,36,0.20)]"
      id={node.attrs.id as string}
      style={pageStyles}
    >
      {/* Page Header */}
      {headerHeight > 0 && (
        <div className="header pointer-events-none relative" style={headerStyles}>
          {options.pageNumber?.position === 'top' && 
            (options.pageNumber?.showOnFirstPage || pageNumber !== 1) && 
            pageNumberLabel}
        </div>
      )}

      {/* Page Content */}
      <NodeViewContent
        className="PageContent overflow-hidden"
        style={contentStyles}
      />

      {/* Page Footer */}
      {footerHeight > 0 && (
        <div className="footer relative" style={footerStyles}>
          {options.pageNumber?.position === 'bottom' && 
            (options.pageNumber?.showOnFirstPage || pageNumber !== 1) && 
            pageNumberLabel}
        </div>
      )}
    </NodeViewWrapper>
  );
};
