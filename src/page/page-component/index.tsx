import React from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { type NodeViewProps } from '@tiptap/core';
import { type PageOptions } from '../types';
import { PAGE } from '../../node-names';

export const PageComponent = ({ editor, node, extension }: NodeViewProps) => {
  const options = extension.options as PageOptions;
  //const pageNumber = node.attrs.pageNumber as number;
  // const totalPage = editor.$nodes(PAGE)?.toString()?.split(',')?.length ?? 0;
  const headerHeight = options.headerHeight;
  const footerHeight = options.footerHeight;

  // TODO: add page number label
  //const pageNumberLabel = `${pageNumber} of ${totalPage}` ;

  return (
    <NodeViewWrapper
      onContextMenu={() => false}
      className="Page prose prose-base relative mx-auto my-2 transform rounded-xl border border-grey-150 bg-white shadow-[0px_0px_8px_0px_rgba(32,33,36,0.20)]"
      id={node.attrs.id as string}
      style={{
        height: `${options.bodyHeight}px`,
        width: `${options.bodyWidth}px`,
        // TODO: add support for different padding on each side
        paddingTop: `${options.bodyPadding}px`,
        paddingBottom: `${options.bodyPadding}px`,
        paddingLeft: `${options.bodyPadding}px`,
        paddingRight: `${options.bodyPadding}px`,
      }}
    >
      <div
        className="header pointer-events-none relative"
        style={{
          height: `${headerHeight}px`,
          width: '100%',
        }}
      ></div>
      <NodeViewContent
        className="PageContent overflow-hidden"
        style={{
          height: `${options.bodyHeight - footerHeight - headerHeight - options.bodyPadding - options.bodyPadding}px`,
          width: `${options.bodyWidth - options.bodyPadding - options.bodyPadding}px`,
        }}
      />
      <div
        className="footer relative"
        style={{
          height: `${footerHeight}px`,
          width: '100%',
        }}
      ></div>
    </NodeViewWrapper>
  );
};
