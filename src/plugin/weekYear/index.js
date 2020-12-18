/**
 * @description: plugin
 * @param {Object} o option
 * @param {Class} c Dayjs类
 */
export default (o, c) => {
  const proto = c.prototype
  /**
   * @description: 获取基于当前语言的按周计算的年份。大部分语言环境下包含1月4日的那一周作为一年的第一周。所以就会出现虽然是上一年，按周算却是下一年的情况
   * @return {Number} 返回按周计算的年数
   */
  proto.weekYear = function () {
    const month = this.month()
    const weekOfYear = this.week()
    const year = this.year()
    // 月数为 12 ，但周数却为1，说明要算到下一年中，就给返回年数加1
    if (weekOfYear === 1 && month === 11) {
      return year + 1
    }
    return year
  }
}
