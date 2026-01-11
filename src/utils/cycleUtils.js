/**
 * Utility functions for the Nway Htway Web App
 */

/**
 * Calculates the progress degree for the cycle progress circle
 * @param {number} cycleLength - Total length of the cycle
 * @param {number} daysUntil - Days until the next period
 * @returns {number} Progress degree (0-360)
 */
export const calculateProgressDegree = (cycleLength, daysUntil) => {
  const displayDay = cycleLength - daysUntil;
  return (displayDay / cycleLength) * 360;
};

/**
 * Gets the display day text based on days until next period
 * @param {number} cycleLength - Total length of the cycle
 * @param {number} daysUntil - Days until the next period
 * @returns {string|number} Display day text
 */
export const getDisplayDay = (cycleLength, daysUntil) => {
  if (daysUntil <= 0) {
    return "Late";
  }
  return cycleLength - daysUntil;
};

/**
 * Generates status text based on days until next period
 * @param {number} daysUntil - Days until the next period
 * @returns {string} Status text
 */
export const getStatusTextString = (daysUntil) => {
  if (daysUntil <= 0) {
    return `ရာသီလာမယ့်ရက်ထက် ${Math.abs(daysUntil)} ရက် ကျော်လွန်နေပါတယ်။`;
  }
  return `နောက်ရာသီလာဖို့ ${daysUntil} ရက် လိုပါသေးတယ်။`;
};