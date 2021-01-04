import { MILLISECONDS_A_DAY, MILLISECONDS_A_HOUR, MILLISECONDS_A_MINUTE, MILLISECONDS_A_SECOND, MILLISECONDS_A_WEEK, REGEX_FORMAT } from '../../constant'

// 1年和1个月的毫秒数
const MILLISECONDS_A_YEAR = MILLISECONDS_A_DAY * 365
const MILLISECONDS_A_MONTH = MILLISECONDS_A_DAY * 30

// 时长的正则
const durationRegex = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/

// 存放所有单位的毫秒数
const unitToMS = {
  years: MILLISECONDS_A_YEAR,
  months: MILLISECONDS_A_MONTH,
  days: MILLISECONDS_A_DAY,
  hours: MILLISECONDS_A_HOUR,
  minutes: MILLISECONDS_A_MINUTE,
  seconds: MILLISECONDS_A_SECOND,
  milliseconds: 1,
  weeks: MILLISECONDS_A_WEEK
}

/**
 * @description: 判断是否是Duration的实例
 * @param {Any} d
 * @return {Boolean}
 */
const isDuration = d => (d instanceof Duration) // eslint-disable-line no-use-before-define

let $d
let $u

/**
 * @description: Duration实例的封装器
 * @param {Number|Object|String} input 值
 * @param {Dayjs} instance Dayjs实例
 * @param {String} unit 单位
 * @return {Duration} 返回一个Duration实例
 */
const wrapper = (input, instance, unit) =>
  new Duration(input, unit, instance.$l) // eslint-disable-line no-use-before-define

/**
 * @description: 给单位加上s
 * @param {String} unit
 * @return {String} 返回units
 */
const prettyUnit = unit => `${$u.p(unit)}s`

class Duration {
  constructor(input, unit, locale) {
    this.$d = {}
    this.$l = locale
    // 如果有单位，就都转成ms的
    if (unit) {
      return wrapper(input * unitToMS[prettyUnit(unit)], this)
    }
    // input是数字，数字就是$ms，解析出$d
    if (typeof input === 'number') {
      this.$ms = input
      this.parseFromMilliseconds()
      return this
    }
    // input是对象，解析出$d和$ms
    if (typeof input === 'object') {
      Object.keys(input).forEach((k) => {
        this.$d[prettyUnit(k)] = input[k]
      })
      // 计算出毫秒数
      this.calMilliseconds()
      return this
    }
    // input是字符串，用正则匹配出$d，然后解析出$ms
    if (typeof input === 'string') {
      const d = input.match(durationRegex)
      if (d) {
        [,,
          this.$d.years, this.$d.months, this.$d.weeks,
          this.$d.days, this.$d.hours, this.$d.minutes, this.$d.seconds] = d
        this.calMilliseconds()
        return this
      }
    }
    // 总之都会解析出$d和$ms
    return this
  }

  /**
   * @description: 用$d对象计算出毫秒数，添加到$ms属性中
   */
  calMilliseconds() {
    this.$ms = Object.keys(this.$d).reduce((total, unit) => (
      total + ((this.$d[unit] || 0) * (unitToMS[unit]))
    ), 0)
  }

  /**
   * @description: 将毫秒数解析为多少年月日时分秒毫秒，添加到$d属性中
   */
  parseFromMilliseconds() {
    let { $ms } = this
    this.$d.years = Math.floor($ms / MILLISECONDS_A_YEAR)
    $ms %= MILLISECONDS_A_YEAR
    this.$d.months = Math.floor($ms / MILLISECONDS_A_MONTH)
    $ms %= MILLISECONDS_A_MONTH
    this.$d.days = Math.floor($ms / MILLISECONDS_A_DAY)
    $ms %= MILLISECONDS_A_DAY
    this.$d.hours = Math.floor($ms / MILLISECONDS_A_HOUR)
    $ms %= MILLISECONDS_A_HOUR
    this.$d.minutes = Math.floor($ms / MILLISECONDS_A_MINUTE)
    $ms %= MILLISECONDS_A_MINUTE
    this.$d.seconds = Math.floor($ms / MILLISECONDS_A_SECOND)
    $ms %= MILLISECONDS_A_SECOND
    this.$d.milliseconds = $ms
  }

  /**
   * @description: 返回ISO格式的时长字符串
   * @return {String}
   */
  toISOString() {
    const Y = this.$d.years ? `${this.$d.years}Y` : ''
    const M = this.$d.months ? `${this.$d.months}M` : ''
    let days = +this.$d.days || 0
    if (this.$d.weeks) {
      days += this.$d.weeks * 7
    }
    const D = days ? `${days}D` : ''
    const H = this.$d.hours ? `${this.$d.hours}H` : ''
    const m = this.$d.minutes ? `${this.$d.minutes}M` : ''
    let seconds = this.$d.seconds || 0
    if (this.$d.milliseconds) {
      seconds += this.$d.milliseconds / 1000
    }
    const S = seconds ? `${seconds}S` : ''
    const T = (H || m || S) ? 'T' : ''
    // 最后把字符串拼接起来
    const result = `P${Y}${M}${D}${T}${H}${m}${S}`
    return result === 'P' ? 'P0D' : result
  }

  /**
   * @description: toJSON和toISOString是相同的
   * @return {String}
   */
  toJSON() {
    return this.toISOString()
  }

  /**
   * @description: 将时长格式化
   * @param {String} formatStr 模板字符串
   * @return {String} 返回格式化后的时长
   */
  format(formatStr) {
    const str = formatStr || 'YYYY-MM-DDTHH:mm:ss'
    const matches = {
      Y: this.$d.years,
      YY: $u.s(this.$d.years, 2, '0'),
      YYYY: $u.s(this.$d.years, 4, '0'),
      M: this.$d.months,
      MM: $u.s(this.$d.months, 2, '0'),
      D: this.$d.days,
      DD: $u.s(this.$d.days, 2, '0'),
      H: this.$d.hours,
      HH: $u.s(this.$d.hours, 2, '0'),
      m: this.$d.minutes,
      mm: $u.s(this.$d.minutes, 2, '0'),
      s: this.$d.seconds,
      ss: $u.s(this.$d.seconds, 2, '0'),
      SSS: $u.s(this.$d.milliseconds, 3, '0')
    }
    return str.replace(REGEX_FORMAT, (match, $1) => $1 || String(matches[match]))
  }

  /**
   * @description: 返回以某个单位为基础的长度，保留小数
   * @param {String} unit 单位
   * @return {Number} 
   */
  as(unit) {
    return this.$ms / (unitToMS[prettyUnit(unit)])
  }

  /**
   * @description: 返回以某个单位的长度，只保留该单位，且为整数
   * @param {String} unit
   * @return {Number}
   */
  get(unit) {
    let base = this.$ms
    const pUnit = prettyUnit(unit)
    if (pUnit === 'milliseconds') {
      base %= 1000
    } else if (pUnit === 'weeks') {
      base = Math.floor(base / unitToMS[pUnit])
    } else {
      base = this.$d[pUnit]
    }
    return base
  }

  /**
   * @description: 给时长添加input * unit
   * @param {Number|Duration} input 要添加的时长
   * @param {String} unit 单位
   * @param {Boolean} isSubtract 是否为减
   * @return {Duration} 返回新的Duration实例
   */
  add(input, unit, isSubtract) {
    let another
    // 统一another为ms
    if (unit) {
      another = input * unitToMS[prettyUnit(unit)]
    } else if (isDuration(input)) {
      another = input.$ms
    } else {
      another = wrapper(input, this).$ms
    }
    // 返回新的Duration实例
    return wrapper(this.$ms + (another * (isSubtract ? -1 : 1)), this)
  }

  /**
   * @description: 给时长减少input * unit
   * @param {Number|Duration} input 要添加的时长
   * @param {String} unit 单位
   * @return {Duration} 返回新的Duration实例
   */
  subtract(input, unit) {
    return this.add(input, unit, true)
  }

  /**
   * @description: 设置Duration实例的locale
   * @param {Object} l locale对象
   * @return {Duration} 返回新的Duration实例
   */
  locale(l) {
    const that = this.clone()
    that.$l = l
    return that
  }

  /**
   * @description: 返回一个相同时长的新实例
   * @return {Duration} 
   */
  clone() {
    return wrapper(this.$ms, this)
  }

  /**
   * @description: 返回显示一段时长，默认没有后缀
   * @param {Boolean} withSuffix 是否添加后缀
   * @return {String}
   */
  humanize(withSuffix) {
    // 利用的是relativeTime插件
    return $d().add(this.$ms, 'ms').locale(this.$l).fromNow(!withSuffix)
  }

  // 下面都是获取对应单位长度的方法，原理相同，as是转化为带小数的值，不带as是只取这一个单位
  milliseconds() { return this.get('milliseconds') }
  asMilliseconds() { return this.as('milliseconds') }
  seconds() { return this.get('seconds') }
  asSeconds() { return this.as('seconds') }
  minutes() { return this.get('minutes') }
  asMinutes() { return this.as('minutes') }
  hours() { return this.get('hours') }
  asHours() { return this.as('hours') }
  days() { return this.get('days') }
  asDays() { return this.as('days') }
  weeks() { return this.get('weeks') }
  asWeeks() { return this.as('weeks') }
  months() { return this.get('months') }
  asMonths() { return this.as('months') }
  years() { return this.get('years') }
  asYears() { return this.as('years') }
}
/**
 * @description: plugin
 * @param {Object} o option
 * @param {Class} c Dayjs类
 * @param {Function} d dayjs函数对象
 */
export default (option, Dayjs, dayjs) => {
  $d = dayjs
  $u = dayjs().$utils()
  /**
   * @description: 把duration方法加到了dayjs函数对象上
   * @param {Number|Object|String} input 值
   * @param {String} unit 单位
   * @return {*}
   */
  dayjs.duration = function (input, unit) {
    const $l = dayjs.locale()
    return wrapper(input, { $l }, unit)
  }
  dayjs.isDuration = isDuration

  const oldAdd = Dayjs.prototype.add
  const oldSubtract = Dayjs.prototype.subtract
  /**
   * @description: 扩展add方法
   * @param {Duration} value 值
   * @param {String} unit 单位
   */
  Dayjs.prototype.add = function (value, unit) {
    if (isDuration(value)) value = value.asMilliseconds()
    return oldAdd.bind(this)(value, unit)
  }
  /**
   * @description: 扩展subtract方法
   * @param {Duration} value 值
   * @param {String} unit 单位
   */
  Dayjs.prototype.subtract = function (value, unit) {
    if (isDuration(value)) value = value.asMilliseconds()
    return oldSubtract.bind(this)(value, unit)
  }
}
