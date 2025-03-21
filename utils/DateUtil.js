// 日期格式化函数
export class DateUtil {
  static formatDate(date, format) {
    if (!date) return ""

    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    const padZero = (num) => {
      return num < 10 ? "0" + num : num
    }

    return format
      .replace(/yyyy/g, year)
      .replace(/MM/g, padZero(month))
      .replace(/dd/g, padZero(day))
      .replace(/HH/g, padZero(hour))
      .replace(/mm/g, padZero(minute))
      .replace(/ss/g, padZero(second))
  }

  static formatEventDate(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // 添加天数
  static addDays(date, days) {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  }

  // 添加周数
  static addWeeks(date, weeks) {
    return addDays(date, weeks * 7)
  }

  // 添加月数
  static addMonths(date, months) {
    const result = new Date(date)
    result.setMonth(result.getMonth() + months)
    return result
  }

  // 添加年数
  static addYears(date, years) {
    const result = new Date(date)
    result.setFullYear(result.getFullYear() + years)
    return result
  }

  // 计算两个日期之间的天数差
  static differenceInDays(dateRight, dateLeft) {
    const timeDiff = Math.abs(dateRight.getTime() - dateLeft.getTime())
    return Math.ceil(timeDiff / (1000 * 3600 * 24))
  }

  // 计算两个日期之间的周数差
  static differenceInWeeks(dateRight, dateLeft) {
    return Math.floor(differenceInDays(dateRight, dateLeft) / 7)
  }

  // 计算两个日期之间的月数差
  static differenceInMonths(dateRight, dateLeft) {
    const months = (dateRight.getFullYear() - dateLeft.getFullYear()) * 12
    return months + dateRight.getMonth() - dateLeft.getMonth()
  }

  // 计算两个日期之间的年数差
  static differenceInYears(dateRight, dateLeft) {
    return dateRight.getFullYear() - dateLeft.getFullYear()
  }

  // 判断两个日期是否是同一天
  static isSameDay(dateLeft, dateRight) {
    return (
      dateLeft.getDate() === dateRight.getDate() &&
      dateLeft.getMonth() === dateRight.getMonth() &&
      dateLeft.getFullYear() === dateRight.getFullYear()
    )
  }

  // 获取某一月的天数
  static getDays(year, month) {
    return new Date(year, month + 1, 0).getDate()
  }
  // 新增日期字符串解析方法
  static parseDateString(dateStr) {
    if (!dateStr) return null;

    // 支持多种分隔符（- /）
    const parts = dateStr.split(/[-\/]/);
    const dateParts = {
      year: parseInt(parts[0], 10),
      month: parts.length > 1 ? parseInt(parts[1], 10) - 1 : null, // 月份转为0-based
      day: parts.length > 2 ? parseInt(parts[2], 10) : null
    };

    return dateParts;
  }

  static parseTimeString(timeStr) {
    // 形如 09:15 的字符串
    if (!timeStr) return null;
    const parts = timeStr.split(':');
    if (parts.length !== 2) return null;
    return {
      hour: parseInt(parts[0], 10),
      minute: parseInt(parts[1], 10)
    };
  }

  static viewShowDate(date) {
    if (!date) return '';
    if (typeof date === 'string') {
      date = new Date(date);
    }
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  }
}
