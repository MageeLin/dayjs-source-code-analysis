/**
 * @description: plugin
 * @param {Object} o option
 * @param {Class} c Dayjs类
 */
export default (o, c) => {
  const proto = c.prototype
  /**
   * @description: 返回时间对象
   * @return {Array} {years, months, days, hours, minutes, seconds, milliseconds}
   */
  proto.toObject = function () {
    return {
      years: this.$y,
      months: this.$M,
      date: this.$D,
      hours: this.$H,
      minutes: this.$m,
      seconds: this.$s,
      milliseconds: this.$ms
    }
  }
}

