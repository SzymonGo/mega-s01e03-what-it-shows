// The problems inside one merged ticket. A problem is something engineering fixes once.
// It starts from the causes in causes.ts; the reports the desk read as a one-day move
// (desk-notes.json) come out of their cause into a problem of their own: no month flipped in
// them, so neither the parser fix nor the hint fix will stop them.
import reports from '#lib/data/reports-4471.json';
import notes from '#lib/data/desk-notes.json';
import { groupByCause, uniqueById, type CauseGroup, type Report } from '#lib/kb/causes';
import { tenantOf } from '#lib/kb/locales';

export type Problem = 'parser' | 'hint' | 'one-day-move' | 'unplaced';

export type ProblemGroup = Omit<CauseGroup, 'cause'> & {
  problem: Problem;
  // How the reports came in: channel → count.
  channels: Record<string, number>;
};

const countBy = (rs: Report[], key: (r: Report) => string) =>
  rs.reduce<Record<string, number>>((n, r) => ({ ...n, [key(r)]: (n[key(r)] ?? 0) + 1 }), {});

export function groupByProblem(merged: Report[], oneDayMove: readonly string[]): ProblemGroup[] {
  const moved = merged.filter((r) => oneDayMove.includes(r.id));
  const rest = merged.filter((r) => !oneDayMove.includes(r.id));
  const groups: ProblemGroup[] = groupByCause(rest, tenantOf).map(({ cause, ...g }) => ({
    ...g,
    problem: cause,
    channels: countBy(g.reports, (r) => r.channel),
  }));
  if (moved.length) {
    // No tenant lookup: every moved report lands in one group, whatever its tenant's cause.
    const [{ cause: _, ...g }] = groupByCause(moved, () => undefined);
    groups.push({ ...g, problem: 'one-day-move', channels: countBy(g.reports, (r) => r.channel) });
  }
  return groups.sort((a, b) => b.reports.length - a.reports.length);
}

// Everything a page needs about one ticket, from the export as it is now.
export function problemsOf(ticket: number) {
  const rows = reports as Report[];
  const merged = uniqueById(rows).filter((r) => r.mergedInto === ticket);
  const repeated = rows.filter((r) => r.mergedInto === ticket).length - merged.length;
  return { merged, repeated, groups: groupByProblem(merged, notes.oneDayMove) };
}
