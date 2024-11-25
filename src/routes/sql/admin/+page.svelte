<script lang="ts">
  import { SqlController } from '$modules/sql/SqlController'

  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  let sqlInput = $state(`SELECT * 
FROM "bskyties" 
ORDER BY "firstTimeHere" DESC
LIMIT 10`)
  let result: any = $state('')
  let error = $state('')

  const queries = {
    indexes: {
      label: 'Indexes',
      sql: `SELECT *
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname`,
    },
    tables: {
      label: 'Table Sizes',
      sql: `SELECT 
  table_name,
  pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as total_size,
  pg_size_pretty(pg_table_size(quote_ident(table_name))) as data_size,
  pg_size_pretty(pg_indexes_size(quote_ident(table_name))) as index_size
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY pg_total_relation_size(quote_ident(table_name)) DESC`,
    },
    dbSize: {
      label: 'Database Size',
      sql: `SELECT 
  current_database() as database_name,		
  pg_size_pretty(pg_database_size(current_database())) as database_size
  `,
    },
    tableSize: {
      label: 'Table Size',
      sql: `SELECT count(*) FROM "record-plcs"
  `,
    },
    kindOfEmbed: {
      label: 'Kind of embed',
      sql: `SELECT DISTINCT (embed->>'kind') AS kind
FROM "log-handles-stats", jsonb_array_elements("metadata"::jsonb->'kindOfEmbed') AS embed;;
  `,
    },
    specialties: {
      label: 'Specialties',
      sql: `WITH parsed_data AS (
  SELECT
    id,
    SUM(CASE 
      WHEN lower(embed->>'kind') LIKE '%link to other post%' THEN (embed->>'count')::int
      ELSE 0 
    END) AS linkInside,
    SUM(CASE 
      WHEN lower(embed->>'kind') LIKE '%link to outside%' THEN (embed->>'count')::int
      ELSE 0 
    END) AS linkOutside,
    SUM(CASE 
      WHEN lower(embed->>'kind') LIKE '%image%' OR lower(embed->>'kind') LIKE '%video%' THEN (embed->>'count')::int
      ELSE 0 
    END) AS art,
    ("metadata"->>'totalPosts')::int AS totalPosts,
    ("metadata"->>'totalReposts')::int AS totalReposts,
    ("metadata"->>'totalLikes')::int AS totalLikes,
    ("metadata"->>'totalPosts')::int + 
    ("metadata"->>'totalReposts')::int + 
    ("metadata"->>'totalLikes')::int AS totalTotal
  FROM "log-handles-stats", json_array_elements("metadata"->'kindOfEmbed') AS embed
  GROUP BY id, "metadata"->>'totalPosts', "metadata"->>'totalReposts', "metadata"->>'totalLikes'
),
classified_data AS (
  SELECT
    id,
    CASE
      WHEN (totalPosts + totalReposts + totalLikes) < 6 THEN 'Observer'
      WHEN (linkOutside::float / totalTotal) > 0.05 THEN 'Explorer'
      WHEN (linkInside::float / totalTotal) > 0.03 THEN 'Connector'
      WHEN (art::float / totalTotal) > 0.03 THEN 'Artist'
      ELSE 'Socialite'
    END AS specialty
  FROM parsed_data
)
SELECT specialty, COUNT(*) AS count
FROM classified_data
GROUP BY specialty
ORDER BY count DESC;
  `,
    },
    plcSync: {
      label: 'PLC Sync',
      sql: `
      SELECT distinct("indexedError"), count(("indexedError"))
FROM "record-plcs"
GROUP BY distinct("indexedError")
LIMIT 50
      `,
    },
  } as const

  function setPresetQuery(queryId: keyof typeof queries) {
    sqlInput = queries[queryId].sql
  }

  async function handleSubmit(e: Event) {
    e.preventDefault()
    try {
      error = ''
      result = { ...(await SqlController.exec(sqlInput)) }
    } catch (e) {
      error = JSON.stringify(e, null, 2)
    }
  }

  function getHeaders(rows: any[]): string[] {
    if (!rows || rows.length === 0) return []
    return Object.keys(rows[0])
  }
</script>

<div class="mx-auto max-w-4xl p-4">
  <h1 class="mb-4 text-2xl font-bold">SQL Admin Console</h1>

  <div class="mb-4 flex flex-wrap gap-2">
    {#each Object.entries(queries) as [id, query]}
      <button class="btn btn-outline btn-sm" onclick={() => setPresetQuery(id as any)}>
        {query.label}
      </button>
    {/each}
  </div>

  <form onsubmit={handleSubmit} class="space-y-4">
    <div class="form-control">
      <textarea
        bind:value={sqlInput}
        class="textarea textarea-bordered h-32 font-mono"
        placeholder="Enter SQL command..."
      ></textarea>
    </div>

    <button type="submit" class="btn btn-primary">Execute SQL</button>
  </form>

  {#if error}
    <pre class="alert alert-error mt-4">{error}</pre>
  {/if}

  {#if result}
    <div class="alert alert-success mt-4 flex justify-between">
      <span class=" text-gray-500">
        {result.took.toFixed(0)} ms
      </span>
      <span class=" text-gray-500">
        {result.r.rowCount} rows
      </span>
    </div>
    <div class="mt-4 overflow-x-auto">
      {#if result.r.rows && result.r.rows.length > 0}
        <table class="table table-zebra bg-base-200">
          <thead>
            <tr>
              {#each getHeaders(result.r.rows) as header}
                <th>{header}</th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each result.r.rows as row}
              <tr>
                {#each Object.values(row) as cell}
                  <td class="max-w-xs">
                    {cell ?? 'null'}
                  </td>
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
      {:else}
        <div class="alert alert-info">No rows returned</div>
      {/if}
    </div>
  {/if}
</div>
