// 日期格式化函数
export function formatDate(date, format) {
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

// 添加天数
export function addDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

// 添加周数
export function addWeeks(date, weeks) {
  return addDays(date, weeks * 7)
}

// 添加月数
export function addMonths(date, months) {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

// 添加年数
export function addYears(date, years) {
  const result = new Date(date)
  result.setFullYear(result.getFullYear() + years)
  return result
}

// 计算两个日期之间的天数差
export function differenceInDays(dateRight, dateLeft) {
  const timeDiff = Math.abs(dateRight.getTime() - dateLeft.getTime())
  return Math.ceil(timeDiff / (1000 * 3600 * 24))
}

// 计算两个日期之间的周数差
export function differenceInWeeks(dateRight, dateLeft) {
  return Math.floor(differenceInDays(dateRight, dateLeft) / 7)
}

// 计算两个日期之间的月数差
export function differenceInMonths(dateRight, dateLeft) {
  const months = (dateRight.getFullYear() - dateLeft.getFullYear()) * 12
  return months + dateRight.getMonth() - dateLeft.getMonth()
}

// 计算两个日期之间的年数差
export function differenceInYears(dateRight, dateLeft) {
  return dateRight.getFullYear() - dateLeft.getFullYear()
}

// 判断两个日期是否是同一天
export function isSameDay(dateLeft, dateRight) {
  return (
    dateLeft.getDate() === dateRight.getDate() &&
    dateLeft.getMonth() === dateRight.getMonth() &&
    dateLeft.getFullYear() === dateRight.getFullYear()
  )
}

