/**
 * Transforms BigInt values to strings in an object or array
 * @param {*} data - The data to transform
 * @returns {*} - The transformed data
 */
const serializeBigInt = (data) => {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'bigint') {
    return data.toString();
  }

  if (Array.isArray(data)) {
    return data.map(item => serializeBigInt(item));
  }

  if (typeof data === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = serializeBigInt(value);
    }
    return result;
  }

  return data;
};

module.exports = {
  serializeBigInt
}; 
