<script lang="ts">
  import { problemsOf, type Problem } from '#lib/kb/problems';

  // One number for a paragraph: <ProblemCount ticket={4471} problem="hint" />. No problem: every report merged.
  let { ticket, problem }: { ticket: number; problem?: Problem } = $props();

  const p = $derived(problemsOf(ticket));
  const n = $derived(problem ? (p.groups.find((g) => g.problem === problem)?.reports.length ?? 0) : p.merged.length);
</script>

<strong>{n}</strong>
