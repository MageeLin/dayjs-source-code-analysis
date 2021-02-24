/**
 * @description: plugin  扩展了 dayjs()，dayjs.utc API 以支持数组参数
 * @param {Object} o option
 * @param {Class} c Dayjs类
 * @param {Function} dayjs dayjs函数对象
 */
export default (o, c, dayjs) => {
  const proto = c.prototype
  /**
   * @description: 根据 cfg 返回对应的 Date 对象（专处理数组格式）
   * @param {Object} cfg config对象
   * @return {Date} Date对象
   */
  const parseDate = (cfg) => {
    const { date, utc } = cfg
    // 处理数组
    if (Array.isArray(date)) {
      // utc模式
      if (utc) {
        if (!date.length) {
          return new Date()
        }
        return new Date(Date.UTC.apply(null, date))
      }
      // 数组长度为1时
      if (date.length === 1) {
        return dayjs(String(date[0])).toDate()
      }
      // https://zhuanlan.zhihu.com/p/35638568 适配ES5的奇技淫巧
      // new (Function.prototype.bind.apply(Date, [null].concat(date)))()
      // new (Date.[Function.prototype.bind](...[null].concat(date)))()
      // new (Date.[Function.prototype.bind](null,...date))()
      // new (Date.bind(null,...date))()
      // new Date(...date)
      return new (Function.prototype.bind.apply(Date, [null].concat(date)))()
    }
    return date
  }

  const oldParse = proto.parse
  /**
   * @description:  解析cfg 主要是把数组格式的date提前处理下，别忘了this对象要指回去
   * @param {Object} cfg
   */
  proto.parse = function (cfg) {
    // 先处理数组格式，没匹配上就通用格式处理
    cfg.date = parseDate.bind(this)(cfg)
    oldParse.bind(this)(cfg)
  }
}
