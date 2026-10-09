import { cleanText } from "./validation.js";

export function matchesQuery(item, query) {
  const keyword = cleanText(query).toLocaleLowerCase();
  if (!keyword) return true;

  return [
    item.title,
    item.description,
    item.category,
    item.location
  ]
    .map((value) => cleanText(value).toLocaleLowerCase())
    .some((value) => value.includes(keyword));
}

export function sortItems(items, direction = "desc") {
  const factor = direction === "asc" ? 1 : -1;
  return [...items].sort((left, right) => {
    const leftTime = new Date(left.createdAt).getTime();
    const rightTime = new Date(right.createdAt).getTime();
    return (leftTime - rightTime) * factor;
  });
}

export function filterItems(items, filters = {}) {
  const {
    type = "all",
    category = "all",
    location = "",
    query = "",
    status = "all",
    sort = "desc"
  } = filters;

  const result = items.filter((item) => {
    if (type !== "all" && item.type !== type) return false;
    if (category !== "all" && item.category !== category) return false;
    if (status !== "all" && item.status !== status) return false;
    if (cleanText(location) && !cleanText(item.location).includes(cleanText(location))) {
      return false;
    }
    return matchesQuery(item, query);
  });

  return sortItems(result, sort);
}
