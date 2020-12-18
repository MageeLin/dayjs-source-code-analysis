/**
 * @description: plugin
 * @param {Object} o option
 * @param {Class} c Dayjs类
 * @param {Function} d dayjs函数对象
 */
export default (o, c, d) => {
  /**
   * @description: 返回一个 boolean 来展示一个时间是否介于两个时间之间
   * @param {String|Dayjs} a 时间
   * @param {String|Dayjs} b 时间
   * @param {String} u unit 时间单位
   * @param {String} i include 区间开闭性 () (] [] [)
   * @return {Boolean} 指示时间是否介于两个时间之间
   */
  c.prototype.isBetween = function (a, b, u, i) {
    // 实例化两端时间
    const dA = d(a)
    const dB = d(b)
    // 判断两端开闭性
    i = i || '()'
    const dAi = i[0] === '('
    const dBi = i[1] === ')'

    // 利用原型上的 isAfter 和 isBefore 实现 isBetween 判断
    return ((dAi ? this.isAfter(dA, u) : !this.isBefore(dA, u)) &&
           (dBi ? this.isBefore(dB, u) : !this.isAfter(dB, u)))
        || ((dAi ? this.isBefore(dA, u) : !this.isAfter(dA, u)) &&
           (dBi ? this.isAfter(dB, u) : !this.isBefore(dB, u)))
  }
}
