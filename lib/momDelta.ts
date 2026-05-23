export function momDelta(points: { monthYear: string; total: number }[]) {
  return points
    .map((p, i) => {
      if (i === 0) return null;
      return { monthYear: p.monthYear, delta: p.total - points[i - 1].total };
    })
    .filter((x): x is { monthYear: string; delta: number } => x !== null);
}
