export function isCedula(value: string, limit = 10) {
  const regex = new RegExp(`^\\d{${limit}}$`);
  return Boolean(value && regex.test(value));
}
