export const parseCursor = (cursor?: string) => {
  if (!cursor) return {};
  return { createdAt: { $lt: new Date(cursor) } };
};

export const buildPagination = (items: any[], limit: number) => {
  const hasMore = items.length === limit;
  const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].createdAt.toISOString() : null;
  return { hasMore, nextCursor };
};
