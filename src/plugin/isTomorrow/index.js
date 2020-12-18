/**
 * @description: plugin
 * @param {Object} o option
 * @param {Class} c Dayjs类
 * @param {Function} d dayjs函数对象
 */
export default (o, c, d) => {
  const proto = c.prototype
  /**
   * @description: 判断当前 Day.js 对象是否是明天。
   * @return {Boolean}
   */
  proto.isTomorrow = function () {
    const comparisonTemplate = 'YYYY-MM-DD'
    // 新建一个明天的实例
    const tomorrow = d().add(1, 'day')

    // 要比较的两个实例同时输出为 YYYY-MM-DD 格式字符串，相同就代表为同一天
    return (
      this.format(comparisonTemplate) === tomorrow.format(comparisonTemplate)
    )
  }
}
