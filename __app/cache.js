import { Cacheable } from "cacheable";
//const cache = new Map();
const cache = new Cacheable({ ttl: "1d" });

const saveCache = async (key, data, expiration) => {
  await cache.set(
    key,
    data,
    expiration == Infinity
      ? 0
      : (new Date(expiration).getTime() - Date.now()) / 1000
  );
};

const getCache = async (key) => {
  const cachedData = await cache.get(key);
  if (!cachedData) {
    return await Promise.resolve({
      status: 404,
      msg: "Cache does not exist",
      value: null,
    });
  }
  return await Promise.resolve({
    status: 200,
    msg: "Success",
    value: cachedData,
  });
};

const deleteCache = async (key) => {
  cache.del(key);
};

export { saveCache, getCache, deleteCache };
