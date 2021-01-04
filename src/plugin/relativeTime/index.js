import * as C from '../../constant'
/**
 * @description: plugin 增加了 .from .to .fromNow .toNow 4 个 API 来展示相对的时间
 * @param {Object} o option
 * @param {Class} c Dayjs类
 * @param {Function} d dayjs函数对象
 */
export default (o, c, d) => {
  o = o || {}
  const proto = c.prototype
  // 定义英文的相对时间格式
  const relObj = {
    future: 'in %s',
    past: '%s ago',
    s: 'a few seconds',
    m: 'a minute',
    mm: '%d minutes',
    h: 'an hour',
    hh: '%d hours',
    d: 'a day',
    dd: '%d days',
    M: 'a month',
    MM: '%d months',
    y: 'a year',
    yy: '%d years'
  }
  d.en.relativeTime = relObj
  /**
   * @description: 核心方法
   * @param {String|Dayjs} input
   * @param {Boolean} withoutSuffix 是否带有后缀
   * @param {Dayjs} instance Dayjs 实例
   * @param {Boolean} isFrom 标志是 from 还是 to
   * @return {String} 返回格式化后的相对时间字符串
   */
  const fromTo = (input, withoutSuffix, instance, isFrom) => {
    const loc = instance.$locale().relativeTime || relObj
    // 阈值设置
    const T = o.thresholds || [
      // 超过44s后被认为是1分钟
      { l: 's', r: 44, d: C.S },
      { l: 'm', r: 89 },
      // 超过44分钟后被认为是1小时
      { l: 'mm', r: 44, d: C.MIN },
      { l: 'h', r: 89 },
      // 超过21小时后被认为是1天
      { l: 'hh', r: 21, d: C.H },
      { l: 'd', r: 35 },
      // 超过25天后被认为是1月
      { l: 'dd', r: 25, d: C.D },
      { l: 'M', r: 45 },
      // 超过10个月后被认为是1年
      { l: 'MM', r: 10, d: C.M },
      { l: 'y', r: 17 },
      { l: 'yy', d: C.Y }
    ]
    const Tl = T.length
    let result
    let out
    let isFuture

    // 迭代
    for (let i = 0; i < Tl; i += 1) {
      let t = T[i]
      // 先计算各个单位上的时间差
      if (t.d) {
        result = isFrom
          ? d(input).diff(instance, t.d, true)
          : instance.diff(input, t.d, true)
      }
      const abs = (o.rounding || Math.round)(Math.abs(result))
      // 判断是过去还是未来
      isFuture = result > 0
      if (abs <= t.r || !t.r) {
        // 找到要转换的单位，开始格式化
        if (abs <= 1 && i > 0) t = T[i - 1] // 1 minutes -> a minute, 0 seconds -> 0 second
        const format = loc[t.l]
        if (typeof format === 'string') {
          out = format.replace('%d', abs)
        } else {
          out = format(abs, withoutSuffix, t.l, isFuture)
        }
        break
      }
    }
    if (withoutSuffix) return out
    /**
     * @description: 添加后缀的函数
     * @param {Boolean} isFuture 是未来还是过去
     * @return {String} 返回需要添加的后缀
     */
    const pastOrFuture = isFuture ? loc.future : loc.past
    if (typeof pastOrFuture === 'function') {
      return pastOrFuture(out)
    }
    return pastOrFuture.replace('%s', out)
  }
  /**
   * @description: 从实例向后到 input 的相对时间
   * @param {Dayjs|String} input 另一个Dayjs实例或者时间字符串
   * @param {Boolean} withoutSuffix 是否取消后缀
   * @return {String} 返回格式化后的相对时间段字符串
   */
  proto.to = function (input, withoutSuffix) {
    return fromTo(input, withoutSuffix, this, true)
  }
  /**
   * @description: 从实例向前距离 input 的相对时间
   * @param {Dayjs|String} input 另一个Dayjs实例或者时间字符串
   * @param {Boolean} withoutSuffix 是否取消后缀
   * @return {String} 返回格式化后的相对时间段字符串
   */
  proto.from = function (input, withoutSuffix) {
    return fromTo(input, withoutSuffix, this)
  }

  /**
   * @description: 当前时刻的Dayjs实例制造器
   * @param {*} thisDay
   * @return {Dayjs} 返回一个当前时刻的Dayjs实例
   */
  const makeNow = thisDay => (thisDay.$u ? d.utc() : d())

  /**
   * @description: 从实例向后到现在的相对时间
   * @param {Boolean} withoutSuffix 是否取消后缀
   * @return {String} 返回格式化后的相对时间段字符串
   */
  proto.toNow = function (withoutSuffix) {
    return this.to(makeNow(this), withoutSuffix)
  }
  /**
   * @description: 从实例向前距离现在的相对时间
   * @param {Boolean} withoutSuffix 是否取消后缀
   * @return {String} 返回格式化后的相对时间段字符串
   */
  proto.fromNow = function (withoutSuffix) {
    return this.from(makeNow(this), withoutSuffix)
  }
}
