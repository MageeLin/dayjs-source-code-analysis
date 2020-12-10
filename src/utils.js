// C 是定义的常量 constant
import * as C from './constant.js'

/**
 * @description: 在 string 的开头补充 pad，直到长度为 length，相当于`string.padStart(length, pad)`
 * @param {String} string 被补充的字符串
 * @param {Number} length 最后的长度
 * @param {String} pad 填充的内容
 * @return {String} 补充后的字符串
 */
const padStart = (string, length, pad) => {
  const s = String(string)
  if (!s || s.length >= length) return string
  // 前面的数组join更简单的表示就是 `pad.repeat(length - string.length)`
  return `${Array((length + 1) - s.length).join(pad)}${string}`
}

/**
 * @description: 返回实例的UTC偏移量（分钟）转化成的 [+|-]HH:mm的格式
 * @param {Dayjs} instance Dayjs的实例
 * @return {String} UTC偏移量 格式：[+|-]HH:mm
 */
const padZoneStr = (instance) => {
  // 这里感觉用Number(instance.utcOffset())会更易读
  const negMinutes = -instance.utcOffset()
  const minutes = Math.abs(negMinutes)
  const hourOffset = Math.floor(minutes / 60)
  const minuteOffset = minutes % 60
  return `${negMinutes <= 0 ? '+' : '-'}${padStart(hourOffset, 2, '0')}:${padStart(minuteOffset, 2, '0')}`
}

/**
 * @description: 求两个实例的月份差
 * @param {Dayjs} a Dayjs的实例
 * @param {Dayjs} b Dayjs的实例
 * @return {Number} 返回两个实例的月份差
 */
const monthDiff = (a, b) => {
  // 来自moment.js的函数，保证能返回相同的结果
  if (a.date() < b.date()) return -monthDiff(b, a)
  const wholeMonthDiff = ((b.year() - a.year()) * 12) + (b.month() - a.month())
  const anchor = a.clone().add(wholeMonthDiff, C.M)
  const c = b - anchor < 0
  const anchor2 = a.clone().add(wholeMonthDiff + (c ? -1 : 1), C.M)
  return +(-(wholeMonthDiff + ((b - anchor) / (c ? (anchor - anchor2) :
    (anchor2 - anchor)))) || 0)
}

/**
 * @description: 向 0 取整
 * @param {Number} n 要取整的数字
 * @return {Number} 取整后的数字
 */
const absFloor = n => (n < 0 ? Math.ceil(n) || 0 : Math.floor(n))

/**
 * @description: 返回 u 对应的单位，能自动适配标准格式和缩写格式
 * @param {String} u M(month) y(year) w(week) d(day) D(date) h(hour) m(minute) s(second) ms(millisecond) Q(quarter) 或 其他字符串
 * @return {String} u 对应的单位
 */
const prettyUnit = (u) => {
  const special = {
    M: C.M,
    y: C.Y,
    w: C.W,
    d: C.D,
    D: C.DATE,
    h: C.H,
    m: C.MIN,
    s: C.S,
    ms: C.MS,
    Q: C.Q
  }
  return (
    // 返回 u 对应的单位
    special[u] ||
    // 或者是把 u 结尾的 字符s 删除，当作单位
    String(u || '')
      .toLowerCase()
      .replace(/s$/, '')
  )
}

/**
 * @description: 判断是否为 undefined
 * @param {Any} s
 * @return {Boolean} true: 是, false: 否
 */
const isUndefined = s => s === undefined

export default {
  s: padStart,
  z: padZoneStr,
  m: monthDiff,
  a: absFloor,
  p: prettyUnit,
  u: isUndefined
}
