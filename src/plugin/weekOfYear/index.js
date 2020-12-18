import { MS, Y, D, W } from '../../constant'

/**
 * @description: plugin
 * @param {Object} o option
 * @param {Class} c Dayjs类
 * @param {Function} d dayjs函数对象
 */
export default (o, c, d) => {
  const proto = c.prototype
  /**
   * @description: 返回一个 number 来get实例是年中第几周，或者通过参数来set实例。默认的原型中是没有 week 这个单位的getter/setter的。
   * @param {Number} week set时的参数，设为第 week 周
   * @return {Number|setter} setter时返回新实例，getter时返回周数
   */
  proto.week = function (week = null) {
    // 有参数，也就是setter，此时就计算week差，然后add上
    if (week !== null) {
      return this.add((week - this.week()) * 7, D)
    }
    // getter
    // 获取设置的yearStart
    const yearStart = this.$locale().yearStart || 1
    // 如果下一年的开始早于本周的最后，就代表是下一年的第一周，返回 1
    if (this.month() === 11 && this.date() > 25) {
      // d(this) is for badMutable
      const nextYearStartDay = d(this).startOf(Y).add(1, Y).date(yearStart)
      const thisEndOfWeek = d(this).endOf(W)
      if (nextYearStartDay.isBefore(thisEndOfWeek)) {
        return 1
      }
    }
    // diffInWeek 小于 0，就返回本周第一天的week数
    const yearStartDay = d(this).startOf(Y).date(yearStart)
    const yearStartWeek = yearStartDay.startOf(W).subtract(1, MS)
    const diffInWeek = this.diff(yearStartWeek, W, true)
    if (diffInWeek < 0) {
      return d(this).startOf('week').week()
    }
    // 普通情况就直接返回 diffInWeek
    return Math.ceil(diffInWeek)
  }

  proto.weeks = function (week = null) {
    return this.week(week)
  }
}
