const pagination = (query, items) => {
  const offset = query.offset || 0;
  const limit = query.limit || 5;

  const pages = Math.ceil(items / limit);

  const curr = Math.floor(offset / limit) + 1;
  const prev = curr > 1 ? curr - 1 : null;
  const next = curr < pages ? curr + 1 : null;

  return {
    offset,
    limit,
    pages,
    prev,
    curr,
    next,
  };
};

export default pagination;
