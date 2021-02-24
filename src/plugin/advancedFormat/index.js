import { FORMAT_DEFAULT } from '../../constant'

/**
 * @description: plugin
 * @param {Object} o option
 * @param {Class} c Dayjs类
 * @param {Function} d dayjs函数对象
 */
export default (o, c, d) => {
  const proto = c.prototype
  const oldFormat = proto.format
  /**
   * @description: 根据数字返回序数
   * 1. 11、12、13结尾用th
   * 2. 1结尾 st
   * 3. 2结尾 nd
   * 4. 3结尾 rd
   * 5. 其余都用 th
   * @param {Number} number 要求序数的数字
   * @return {String} [21st]
   */
  d.en.ordinal = (number) => {
    const s = ['th', 'st', 'nd', 'rd']
    // 每 100 个数字循环
    const v = number % 100
    // 先把 20 - 100的数字拿出来，每10个为一组，去匹配 ['th', 'st', 'nd', 'rd']，也就是匹配到了20 - 100的每个123
    // 再（1 - 20全部）和（20 - 100中不以123结尾）的数字，去匹配['th', 'st', 'nd', 'rd']，也就是把1、2、3三个数变一下
    // 最后剩下的全给th
    return `[${number}${(s[(v - 20) % 10] || s[v] || s[0])}]`
  }
  // 在这里扩展英文 locale
  /**
   * @description: 扩展了 dayjs().format API 以支持更多模版
   * @param {String} formatStr 格式化模板
   * @return {String} 格式化后的文本
   */
  proto.format = function (formatStr) {
    // 和src/index.js中的format函数实现基本一致
    const locale = this.$locale()
    const utils = this.$utils()
    const str = formatStr || FORMAT_DEFAULT
    const result = str.replace(/\[([^\]]+)]|Q|wo|ww|w|zzz|z|gggg|Do|X|x|k{1,2}|S/g, (match) => {
      switch (match) {
        // 季度 Quarter
        case 'Q':
          return Math.ceil((this.$M + 1) / 3)
        // 带序数词的月份里的一天 Date ordinal
        case 'Do':
          return locale.ordinal(this.$D)
        // 按周计算的年份 Week Year
        case 'gggg':
          return this.weekYear()
        // 带序号的按周计算的年份 week ordinal
        case 'wo':
          return locale.ordinal(this.week(), 'W') // W for week
        // 周数 week
        case 'w':
        // 周数，两位数 Week
        case 'ww':
          return utils.s(this.week(), match === 'w' ? 1 : 2, '0')
        // 时：由 1 开始 hour
        case 'k':
        // 时：由 1 开始，两位数 Hour
        case 'kk':
          return utils.s(String(this.$H === 0 ? 24 : this.$H), match === 'k' ? 1 : 2, '0')
        // 秒为单位的 Unix 时间戳 second
        case 'X':
          return Math.floor(this.$d.getTime() / 1000)
        // 毫秒单位的 Unix 时间戳 millisecond
        case 'x':
          return this.$d.getTime()
        // UTC 偏移量的缩写 EST
        case 'z':
          return `[${this.offsetName()}]`
        // UTC 偏移量的全名 Eastern Standard Time
        case 'zzz':
          return `[${this.offsetName('long')}]`
        // 其他情况就去匹配oldFormat
        default:
          return match
      }
    })
    return oldFormat.bind(this)(result)
  }
}

