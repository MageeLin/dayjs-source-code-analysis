/**
 * @description: plugin
 * @param {Object} o option
 * @param {Class} c Dayjs类
 * @param {Function} d dayjs函数对象
 */
export default (o, c) => {
  const proto = c.prototype
  /**
   * @description: 计算实例所在年的 ISO 周总数
   * @return {Number} 返回 52 或 53
   */
  proto.isoWeeksInYear = function () {
    const isLeapYear = this.isLeapYear()
    const last = this.endOf('y')
    const day = last.day()
    if (day === 4 || (isLeapYear && day === 5)) {
      return 53
    }
    return 52
  }
}
