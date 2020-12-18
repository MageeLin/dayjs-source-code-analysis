/**
 * @description: plugin
 * @param {Object} o option
 * @param {Class} c Dayjs类
 * @param {Function} d dayjs函数对象
 */
export default (o, c, d) => {
  const proto = c.prototype
  /**
   * @description: 判断当前 Day.js 对象是否是昨天。
   * @return {Boolean}
   */
  proto.isYesterday = function () {
    const comparisonTemplate = 'YYYY-MM-DD'
    // 新建一个昨天的实例
    const yesterday = d().subtract(1, 'day')

    // 要比较的两个实例同时输出为 YYYY-MM-DD 格式字符串，相同就代表为同一天
    return (
      this.format(comparisonTemplate) === yesterday.format(comparisonTemplate)
    )
  }
}
