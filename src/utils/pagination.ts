export interface ExtractedPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function extractPagination(
  resPayload: any,
  defaultLimit: number = 20
): ExtractedPagination {
  const p =
    resPayload?.pagination ||
    resPayload?.data?.pagination ||
    resPayload?.meta?.pagination ||
    null;

  if (p) {
    const page = Number(p.page || 1);
    const limit = Number(p.limit || defaultLimit);
    const total = Number(p.total ?? 0);
    const totalPages = Math.max(1, Number(p.totalPages || Math.ceil(total / (limit || 1)) || 1));
    return { page, limit, total, totalPages };
  }

  const rawList = Array.isArray(resPayload?.data?.data)
    ? resPayload.data.data
    : Array.isArray(resPayload?.data)
    ? resPayload.data
    : Array.isArray(resPayload)
    ? resPayload
    : [];

  return {
    page: 1,
    limit: defaultLimit,
    total: rawList.length,
    totalPages: 1,
  };
}
