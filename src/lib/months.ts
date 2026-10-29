export const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

// "Sep", "sept" and "September" all read as 8; anything else is undefined.
export function monthIndex(name: string): number | undefined {
  const index = SHORT_MONTHS.findIndex((month) => month.toLowerCase() === name.slice(0, 3).toLowerCase())
  return index < 0 ? undefined : index
}
