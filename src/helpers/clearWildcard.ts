export const clearWildcard = (value: string) => {
  value = value.replace(/\/\*\*/g, "");
  value = value.replace(/\/\*/g, "");
  return value;
};
