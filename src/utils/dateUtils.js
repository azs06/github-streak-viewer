const formatDate = (date, options = {}) => {
  const defaultOptions = {
    month: "short",
    day: "numeric",
  };
  const optionToUse = { ...defaultOptions, ...options };
  return new Date(date)?.toLocaleDateString("en-US", optionToUse);
};


export {
    formatDate
}