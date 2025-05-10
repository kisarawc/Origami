/**
 * Utility functions for date formatting
 */

/**
 * Format a date string to a readable format
 * Handles both ISO string and MongoDB LocalDateTime format
 * 
 * @param {string} dateString - The date string to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'Unknown date';

  try {
    // Parse the date string
    let date;
    if (dateString.includes('T') || dateString.includes('Z')) {
      // ISO format
      date = new Date(dateString);
    } else {
      // Assume format like "2023-06-15 14:30:00"
      date = new Date(dateString.replace(' ', 'T') + 'Z');
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }

    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  } catch (error) {
    console.error('Error formatting date:', error, dateString);

    // Fallback: try to extract just the date part
    try {
      if (dateString.includes('-')) {
        const datePart = dateString.split(' ')[0].split('T')[0];
        const [year, month, day] = datePart.split('-').map(Number);
        if (year && month && day) {
          return `${month}/${day}/${year}`;
        }
      }
    } catch (e) {
      console.error('Fallback date parsing failed:', e);
    }

    return 'Recently';
  }
};

/**
 * Format a Java LocalDateTime object to a readable format
 * 
 * @param {Object} dateObj - The LocalDateTime object
 * @returns {string} - Formatted date string
 */
export const formatLocalDateTime = (dateObj) => {
  if (!dateObj) return 'Unknown date';

  try {
    const year = dateObj.year || 0;
    const month = (dateObj.monthValue || 1).toString().padStart(2, '0');
    const day = (dateObj.dayOfMonth || 1).toString().padStart(2, '0');
    const hour = (dateObj.hour || 0).toString().padStart(2, '0');
    const minute = (dateObj.minute || 0).toString().padStart(2, '0');
    const second = (dateObj.second || 0).toString().padStart(2, '0');

    const dateString = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    return formatDate(dateString);
  } catch (error) {
    console.error('Error formatting LocalDateTime object:', error);
    return 'Recently';
  }
};
