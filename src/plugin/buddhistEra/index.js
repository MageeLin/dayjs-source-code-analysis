import { FORMAT_DEFAULT } from '../../constant'

/**
 * @description: plugin  扩展了 dayjs().format API 以支持佛历格式化。
 * @param {Object} o option
 * @param {Class} c Dayjs类
 */
export default (o, c) => {
  const proto = c.prototype
  const oldFormat = proto.format
  /**
   * @description: 扩展格式化方法，佛历只需在年份中添加 543年
   * @param {String} formatStr
   * @return {String}
   */
  proto.format = function (formatStr) {
    const yearBias = 543
    const str = formatStr || FORMAT_DEFAULT
    const result = str.replace(/(\[[^\]]+])|BBBB|BB/g, (match, a) => {
      // 添加偏移
      const year = String(this.$y + yearBias)
      // 判断4位还是2位
      const args = match === 'BB' ? [year.slice(-2), 2] : [year, 4]
      return a || this.$utils().s(...args, '0')
    })
    return oldFormat.bind(this)(result)
  }
}
