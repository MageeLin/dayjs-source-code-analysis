/**
 * @description: plugin 扩展了 dayjs(), dayjs.utc, dayjs().set, dayjs().add, dayjs().subtract API 以支持传入对象参数。
 * @param {Object} o option
 * @param {Class} c Dayjs类
 * @param {Function} day dayjs函数对象
 */
export default (o, c, dayjs) => {
  const proto = c.prototype
  /**
   * @description: 判断obj是不是对象，不能是Date实例也不能是Array
   * @param {Any} obj 
   * @return {Boolean}
   */
  const isObject = obj => !(obj instanceof Date) && !(obj instanceof Array) && obj instanceof Object
  /**
   * @description: 扩展prettyUnit，当单位为date或dates时，转化为day
   * @param {String} u 单位
   * @return {String}
   */
  const prettyUnit = (u) => {
    const unit = proto.$utils().p(u)
    return unit === 'date' ? 'day' : unit
  }
  /**
   * @description: 扩展parseDate，增加对象的处理
   * @param {Object} cfg config 配置
   * @return {Date} 返回对应的Date对象
   */
  const parseDate = (cfg) => {
    const { date, utc } = cfg
    const $d = {}
    // 是对象时才走下述逻辑
    if (isObject(date)) {
      if (!Object.keys(date).length) {
        return new Date()
      }
      const now = utc ? dayjs.utc() : dayjs()
      // 格式化各个单位的值
      Object.keys(date).forEach((k) => {
        $d[prettyUnit(k)] = date[k]
      })
      const d = $d.day || ((!$d.year && !($d.month >= 0)) ? now.date() : 1)
      const y = $d.year || now.year()
      const M = $d.month >= 0 ? $d.month : ((!$d.year && !$d.day) ? now.month() : 0)// eslint-disable-line no-nested-ternary,max-len
      const h = $d.hour || 0
      const m = $d.minute || 0
      const s = $d.second || 0
      const ms = $d.millisecond || 0
      // 解析为 Date 对象
      if (utc) {
        return new Date(Date.UTC(y, M, d, h, m, s, ms))
      }
      return new Date(y, M, d, h, m, s, ms)
    }
    return date
  }

  const oldParse = proto.parse
  /**
   * @description: 扩展parse，使其解析对象
   * @param {Object} cfg config 配置
   */
  proto.parse = function (cfg) {
    // 给cfg对象添加了date属性
    cfg.date = parseDate.bind(this)(cfg)
    oldParse.bind(this)(cfg)
  }

  const oldSet = proto.set
  const oldAdd = proto.add

  /**
   * @description: 定义了一个绑定调用的基础方法
   * @param {Function} call 原本的set add和subtract
   * @param {Number|Object} argument 数量或数量对象
   * @param {String} string argument 不是对象时需要指定单位 unit
   * @param {Number} offset 1是加，-1是减
   * @return {*}
   */
  const callObject = function (call, argument, string, offset = 1) {
    // argument为对象时迭代着修改每个单位
    if (argument instanceof Object) {
      const keys = Object.keys(argument)
      let chain = this
      keys.forEach((key) => {
        // 每次返回新实例后要重新绑定this为新实例，所以能迭代的修改各个单位
        chain = call.bind(chain)(argument[key] * offset, key)
      })
      return chain
    }
    // argument为Number时，就只修改string单位的值，为了add和subtract用
    return call.bind(this)(argument * offset, string)
  }

  /**
   * @description: 扩展set
   * @param {String} string 单位
   * @param {Number} int 值
   * @return {Dayjs}
   */
  proto.set = function (string, int) {
    int = int === undefined ? string : int
    /**
     * @description: 设置call函数
     * @param {Number} i 值
     * @return {String} s 单位
     */
    return callObject.bind(this)(function (i, s) {
      return oldSet.bind(this)(s, i)
    }, int, string)
  }
  /**
   * @description: 扩展add
   * @param {Number} number 值
   * @param {String} string 单位
   * @return {Dayjs}
   */
  proto.add = function (number, string) {
    return callObject.bind(this)(oldAdd, number, string)
  }
  /**
   * @description: 扩展subtract
   * @param {Number} number 值
   * @param {String} string 单位
   * @return {Dayjs}
   */
  proto.subtract = function (number, string) {
    return callObject.bind(this)(oldAdd, number, string, -1)
  }
}
