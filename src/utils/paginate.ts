export function paginate<T>(items: T[], page: number, itemsPerPage = 20): T[] {
  return items.slice((page - 1) * itemsPerPage, page * itemsPerPage)
}
