const cache = new Map();

const saveCache = async (key, data, expiration) => {
  await cache.set(key, { data, expiration });
};

const getCache = async (key, date) => {
  const cachedData = cache.get(key);
  const isExpired = (cacheExpiration, currentDate) => {
    if (cacheExpiration == Infinity) return false;
    return (
      new Date(cacheExpiration).getTime() <= new Date(currentDate).getTime()
    );
  };
  //let response = null;
  if (!cachedData) {
    return await Promise.resolve({
      status: 404,
      msg: "Cache does not exist",
      value: null,
    });
  }
  if (isExpired(cachedData.expiration, date)) {
    cache.delete(key);
    return await Promise.resolve({
      status: 410,
      msg: "Cache expired",
      value: null,
    });
  }
  return await Promise.resolve({
    status: 200,
    msg: "Success",
    value: cachedData.data,
  });
};

module.exports = {
  saveCache,
  getCache,
};
