/**
 * Generate a unique order number
 * Format: yyyyMMddHHmmssSSS + 4 random digits
 * @returns {string} Order number
 */
function generateOrderNo() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');

  return `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}${random}`;
}

module.exports = {
  generateOrderNo,
}; 
