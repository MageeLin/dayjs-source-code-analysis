/**
 * @description: plugin
 * @param {Object} o option
 * @param {Class} c Dayjs类
 */
export default (o, c) => {
  const proto = c.prototype
  /**
   * @description: 获取或设置当前语言的星期。
   * @param {Number} input
   * @return {Number|Dayjs} getter时返回本周的第几天，setter时返回新实例
   */
  proto.weekday = function (input) {
    // locale 中设置的一周开始，中文是星期一开始，所以是weekStart = 1
    const weekStart = this.$locale().weekStart || 0
    // 今天是周三，所以是$W = 3
    const { $W } = this
    // 周三的 weekday = 3 - 1 = 2
    const weekday = ($W < weekStart ? $W + 7 : $W) - weekStart
    if (this.$utils().u(input)) {
      return weekday
    }
    // 减去2天，是周一，加上input天，就代表这设为了本周的第input天
    return this.subtract(weekday, 'day').add(input, 'day')
  }
}

