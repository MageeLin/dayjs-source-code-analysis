/**
 * @description: plugin
 * @param {Object} o option
 * @param {Class} c Dayjs类
 */
export default (o, c) => {
  /**
   * @description: 返回一个 boolean 来实例是否和一个时间相同或在该时间之后。
   * @param {Dayjs} that 另一个Dayjs实例
   * @param {String} unit 时间单位
   * @return {Boolean}
   */
  c.prototype.isSameOrBefore = function (that, units) {
    // 调用了 isSame 和 isBefore
    return this.isSame(that, units) || this.isBefore(that, units)
  }
}
