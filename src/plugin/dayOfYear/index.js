/**
 * @description: plugin  
 * @param {Object} o option
 * @param {Class} c Dayjs类
 */
export default (o, c) => {
  const proto = c.prototype
  /**
   * @description: 返回一个 number 来表示 Dayjs 的日期是年中第几天，或设置成是年中第几天。
   * @param {Number} input setter时，设置成是年中第input天
   * @return {Number|Dayjs} 为getter时，返回日期是年中第几天，setter时，返回新的实例
   */
  proto.dayOfYear = function (input) {
    // 1000*60*60*24 = 86400000 = 864e5
    // 计算今年第一天与当前差的天数
    const dayOfYear = Math.round((this.startOf('day') - this.startOf('year')) / 864e5) + 1
    // setter时，就补齐差距并返回新实例，getter时返回差距
    return input == null ? dayOfYear : this.add(input - dayOfYear, 'day')
  }
}
