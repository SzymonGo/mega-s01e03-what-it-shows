<script lang="ts">
  import { problemsOf, type Problem } from '#lib/kb/problems';

  // issues: where each problem is tracked now, problem → URL.
  let { ticket, issues = {} }: { ticket: number; issues?: Partial<Record<Problem, string>> } = $props();

  const p = $derived(problemsOf(ticket));
  // Distinct reports across the groups: a report filed under its cause and read as a one-day move counts once here.
  const placed = $derived(new Set(p.groups.flatMap((g) => g.reports.map((r) => r.id))).size);
  const overlaps = $derived(p.groups.filter((g) => g.alsoIn.length));
  const list = (counts: Record<string, number>) =>
    Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([k, n]) => `${k} ×${n}`)
      .join(' · ');
  const issueNo = (url: string) => `#${url.split('/').pop()}`;
</script>

<p class="sum">
  <strong>{p.merged.length}</strong> reports merged into #{ticket} ·
  <strong>{p.groups.length}</strong>
  {p.groups.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>channels</th><th>intake tagged as</th><th>tenants</th><th>seen</th><th>tracked in</th></tr>
  </thead>
  <tbody>
    {#each p.groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code></td>
        <td><strong>{g.reports.length}</strong></td>
        <td class="tags">{list(g.channels)}</td>
        <td class="tags">{list(g.taggedAs)}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>
          {#if issues[g.problem]}<a href={issues[g.problem]}>{issueNo(issues[g.problem]!)}</a>{:else}<span class="none">no ticket</span>{/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<p class="note" class:off={placed !== p.merged.length}>
  {placed} of {p.merged.length} reports placed{placed === p.merged.length ? ', none left over' : ' — check the export'}.
  {#each overlaps as g (g.problem)}
    The {g.reports.length} <code>{g.problem}</code> reports are counted under <code>{g.alsoIn.join(', ')}</code> too, where the desk files them.
  {/each}
  {#if p.repeated}The export lists {p.repeated} of them twice; each counts once, by id.{/if}
</p>

<style>
  .sum { font-size: 1.1rem; }
  .tags { color: var(--muted); font-size: 0.85em; }
  .note { color: var(--muted); font-size: 0.85em; }
  .off, .none { color: var(--warn); font-weight: 600; }
</style>
