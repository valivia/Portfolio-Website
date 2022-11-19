export default function Age({ date }: { date: string }): number {
  const dob = new Date(date);
  const diff_ms = Date.now() - dob.getTime();
  const age_dt = new Date(diff_ms);
  const age = Math.abs(age_dt.getUTCFullYear() - 1970);

  return age;
}