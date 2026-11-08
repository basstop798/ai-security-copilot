// "9250" -> "9 250 DA". Hand-rolled rather than Intl so the server render
// and the browser always produce the same string.
export function formatDA(amount: number): string {
  const digits = String(Math.round(amount)).replace(
    /\B(?=(\d{3})+(?!\d))/g,
    " ",
  );
  return `${digits} DA`;
}
