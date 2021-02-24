/**
 * @description: plugin
 * @param {Object} o option
 * @param {Class} c Dayjs类
 */
export default (o, c) => {
  const proto = c.prototype
  /**
   * @description: 返回时间数组
   * @return {Array} [years, months, days, hours, minutes, seconds, milliseconds]
   */
  proto.toArray = function () {
    return [
      this.$y,
      this.$M,
      this.$D,
      this.$H,
      this.$m,
      this.$s,
      this.$ms
    ]
  }
}

