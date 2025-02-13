export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    month: "short",
    day: "numeric",
  };
  const optionToUse = Object.assign({}, defaultOptions, options);
  return new Date(date)?.toLocaleDateString("en-US", optionToUse);
};
