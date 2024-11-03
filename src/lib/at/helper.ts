export const describeRepo = async (
  fetchToUse: any,
  pds: string,
  repo: string
) => {
  const describeRepoUrl = new URL(`${pds}/xrpc/com.atproto.repo.describeRepo`);
  describeRepoUrl.searchParams.set("repo", repo);
  const res = await fetchToUse(describeRepoUrl.toString());
  if (!res.ok && res.status !== 400) {
    throw new Error(`Failed to describe repo: ${res.statusText}`);
  }
  const body = await res.json();

  if (res.status === 400 && "error" in body && body.error === "RepoNotFound") {
    return null;
  }

  return body as {
    collections: string[];
  };
};

export const listRecords = async (
  fetchToUse: any,
  pds: string,
  repo: string,
  collection: string,
  options?: {
    cursor?: string;
    limit?: number;
  }
) => {
  const listRecordsUrl = new URL(`${pds}/xrpc/com.atproto.repo.listRecords`);
  listRecordsUrl.searchParams.set("repo", repo);
  listRecordsUrl.searchParams.set("collection", collection);
  listRecordsUrl.searchParams.set("limit", options?.limit?.toString() ?? "50");
  if (options?.cursor) {
    listRecordsUrl.searchParams.set("cursor", options.cursor);
  }
  const res = await fetchToUse(listRecordsUrl.toString());
  if (!res.ok) {
    throw new Error(`Failed to list records: ${res.statusText}`);
  }
  return await res.json();
};

export const getRecord = async (
  fetchToUse: any,
  pds: string,
  repo: string,
  collection: string,
  rkey: string
) => {
  // const uriObj = new AtUri(uri);
  const getRecordUrl = new URL(`${pds}/xrpc/com.atproto.repo.getRecord`);
  getRecordUrl.searchParams.set("repo", repo);
  getRecordUrl.searchParams.set("collection", collection);
  getRecordUrl.searchParams.set("rkey", rkey);
  const res = await fetchToUse(getRecordUrl.toString());
  if (!res.ok) {
    throw new Error(`Failed to get record: ${res.statusText}`);
  }
  return await res.json();
};

export const listRecordsAll = async (
  fetchToUse: any,
  pds: string,
  repo: string,
  collection: string,
  options?: {
    while?: (record: any) => boolean;
  }
) => {
  const allRecords: Array<{
    uri: string;
    cid: string;
    value: any;
  }> = [];

  let cursor: string | undefined = undefined;

  while (true) {
    const response = await listRecords(fetchToUse, pds, repo, collection, {
      cursor,
      limit: 100,
    });

    if (options?.while) {
      try {
        for (const record of response.records) {
          if (options.while(record)) {
            allRecords.push(record);
          } else {
            break;
          }
        }
      } catch (error) {}
    } else {
      allRecords.push(...response.records);
    }

    if (!response.cursor) {
      break;
    }
    cursor = response.cursor;
  }

  return { records: allRecords };
};
