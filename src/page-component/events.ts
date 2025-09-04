import mitt from 'mitt';

type PageEvents = {
  totalPageChange: number;
};
export const emitter = mitt<PageEvents>();
