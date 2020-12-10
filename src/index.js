import * as C from './constant.js'
import en from './locale/en.js'
import U from './utils.js'

let L = 'en' // 全局 locale
const Ls = {} // 全局的已加载 locale 映射
Ls[L] = en

/**
 * @description: 判断对象是否为Dayjs的实例
 * @param {object} d 对象
 * @return {Boolean}
 */
const isDayjs = d => d instanceof Dayjs // eslint-disable-line no-use-before-define

/**
 * @description: 给全局locale映射添加一个键值对或修改已有键值对
 * @param {String|Object} preset 预设的local对象或名称字符串
 * @param {Object} object locale对象
 * @param {Boolean} isLocal 是否为本地的 locale
 * @return {String} 返回键名
 */
const parseLocale = (preset, object, isLocal) => {
  let l
  // 不带参数时，返回当前使用的locale键
  if (!preset) return L
  // 不管preset是对象还是字符串，都去映射键值对
  if (typeof preset === 'string') {
    if (Ls[preset]) {
      l = preset
    }
    if (object) {
      Ls[preset] = object
      l = preset
    }
  } else {
    const { name } = preset
    Ls[name] = preset
    l = name
  }
  // 如果不用本地的locale，就修改L，最后返回l
  if (!isLocal && l) L = l
  return l || (!isLocal && L)
}

/**
 * @description: 实例化Dayjs的方法，如果参数已经是Dayjs的实例，就直接返回
 * @param {Date|Dayjs} date Date或者Dayjs对象
 * @param {Object} c Date或者Dayjs对象
 * @return {Dayjs} 返回一个Dayjs实例
 */
const dayjs = function (date, c) {
  if (isDayjs(date)) {
    return date.clone()
  }
  // eslint-disable-next-line no-nested-ternary
  const cfg = typeof c === 'object' ? c : {}
  cfg.date = date
  cfg.args = arguments// eslint-disable-line prefer-rest-params
  // cfg: {date, args: arguments}
  return new Dayjs(cfg) // eslint-disable-line no-use-before-define
}

/**
 * @description: 封装器，根据Date对象和Dayjs实例封装出一个新实例
 * @param {Date} date Date对象
 * @param {Dayjs} instance 已存在的Dayjs实例
 * @return {Dayjs}
 */
const wrapper = (date, instance) =>
  dayjs(date, {
    locale: instance.$L,
    utc: instance.$u,
    x: instance.$x,
    $offset: instance.$offset // todo: refactor; do not use this.$offset in you code
  })

// 把上面写的几个方法同样加到 Utils 工具包中
const Utils = U // for plugin use
Utils.l = parseLocale
Utils.i = isDayjs
Utils.w = wrapper

/**
 * @description: 根据 cfg 返回对应的 Date 对象
 * @param {Object} cfg config 配置对象 {date, utc}
 * @return {Date} 返回 Date 对象
 */
const parseDate = (cfg) => {
  const { date, utc } = cfg
  if (date === null) return new Date(NaN) // null 时返回 new Date(NaN)
  if (Utils.u(date)) return new Date() // undefined 时返回 new Date()
  if (date instanceof Date) return new Date(date) // Date实例时 返回 new Date(date)
  if (typeof date === 'string' && !/Z$/i.test(date)) { //string 时, 用REGEX_PARSE来解析返回
    const d = date.match(C.REGEX_PARSE)
    if (d) {
      const m = d[2] - 1 || 0
      const ms = (d[7] || '0').substring(0, 3)
      if (utc) {
        return new Date(Date.UTC(d[1], m, d[3]
          || 1, d[4] || 0, d[5] || 0, d[6] || 0, ms))
      }
      return new Date(d[1], m, d[3]
          || 1, d[4] || 0, d[5] || 0, d[6] || 0, ms)
    }
  }

  return new Date(date) // 其他格式都直接走 new Date(date)
}

/**
 * @description: Dayjs类
 * @param {Object} cfg config 配置对象
 */
class Dayjs {
  constructor(cfg) {
    this.$L = parseLocale(cfg.locale, null, true) // $L 存放当前 locale
    this.parse(cfg) // for plugin
  }

  /**
   * @description: 解析cfg
   * @param {Object} cfg config 配置对象
   */
  parse(cfg) {
    this.$d = parseDate(cfg) // $d 存放 Date 对象
    this.$x = cfg.x || {} // $x 存放 {$timezone, $localOffset} 时区有关信息
    this.init()
  }

  /**
   * @description: 初始化内部变量
   */
  init() {
    const { $d } = this
    this.$y = $d.getFullYear() // 2020
    this.$M = $d.getMonth() // 11
    this.$D = $d.getDate() // 8
    this.$W = $d.getDay() // 2
    this.$H = $d.getHours() // 7
    this.$m = $d.getMinutes() // 6
    this.$s = $d.getSeconds() // 1
    this.$ms = $d.getMilliseconds() // 425
  }

  /**
   * @description: 返回完备的工具库
   * @return {Object} Utils对象
   * @private
   */
  $utils() {
    return Utils
  }

  /**
   * @description: 返回 Date 对象是否合规
   * @return {Boolean}
   */
  isValid() {
    return !(this.$d.toString() === C.INVALID_DATE_STRING)
  }

  /**
   * @description: 本实例是否和that提供的日期时间相同
   * @param {Dayjs|String} that 另一个Dayjs实例或者时间字符串
   * @param {String} units 单位
   * @return {Boolean} 只要在单位的时间段内，就算相同
   */
  isSame(that, units) {
    const other = dayjs(that)
    // 用给定单位内本实例的 start 和 end 来夹逼 that 实例
    return this.startOf(units) <= other && other <= this.endOf(units)
  }

  /**
   * @description: 给定单位下，本实例的时间是否晚于that提供的时间
   * @param {Dayjs|String} that 另一个Dayjs实例或者时间字符串
   * @param {String} units 单位
   * @return {Boolean}
   */
  isAfter(that, units) {
    return dayjs(that) < this.startOf(units)
  }

  /**
   * @description: 给定单位下，本实例的时间是否早于that提供的时间
   * @param {Dayjs|String} that 另一个Dayjs实例或者时间字符串
   * @param {String} units 单位
   * @return {Boolean}
   */
  isBefore(that, units) {
    return this.endOf(units) < dayjs(that)
  }

  /**
   * @description: 获取或设置单位
   * @param {Number} input 要设置的值
   * @return {Number|Dayjs} 有input时，设置值并返回实例；无input时，返回对应单位的数值
   */
  $g(input, get, set) {
    // 无参数就get，有参数就set
    if (Utils.u(input)) return this[get]
    return this.set(set, input)
  }

  /**
   * @description: 返回秒做单位的 Unix 时间戳 (10 位数字)
   * @return {Number} 十位时间戳
   */
  unix() {
    return Math.floor(this.valueOf() / 1000)
  }

  /**
   * @description: 根据实例关联的Date对象返回13位时间戳 ms 
   * @return {Number} 时间戳 eg.1607404331806
   */
  valueOf() {
    // timezone(hour) * 60 * 60 * 1000 => ms
    return this.$d.getTime()
  }

  /**
   * @description: 根据单位将实例设置到一个时间段的开始
   * @param {String} units 单位
   * @param {Boolean} startOf 标志，true:startOf, false: endOf
   * @return {Dayjs} 返回新的 Dayjs 实例，cfg与原实例相同
   */
  startOf(units, startOf) { 
    // 用于切换 startOf 和 endOf
    const isStartOf = !Utils.u(startOf) ? startOf : true
    const unit = Utils.p(units)
    /**
     * @description: 实例工厂函数，根据月日（参数）和年份（实例）创建新的Dayjs实例
     * @param {Number} d 日
     * @param {Number} m 月
     * @return {Dayjs} 返回新实例，如果 isStartOf 为 false，返回当天的 endOf
     */
    const instanceFactory = (d, m) => {
      const ins = Utils.w(
        this.$u ? Date.UTC(this.$y, m, d) : new Date(this.$y, m, d),
        this
      )
      return isStartOf ? ins : ins.endOf(C.D)
    }
    /**
     * @description: 根据传入的method来返回Dayjs新实例
     * @param {String} method 例如 setHours、setUTCHours
     * @param {Number} slice 截断参数数组 
     * @return {Dayjs} 返回新实例，
     */
    const instanceFactorySet = (method, slice) => {
      // 传递给apply的参数数组
      const argumentStart = [0, 0, 0, 0]
      const argumentEnd = [23, 59, 59, 999]
      return Utils.w(
        this.toDate()[method].apply(
          this.toDate('s'),
          (isStartOf ? argumentStart : argumentEnd).slice(slice)
        ),
        this
      )
    }

    // 获取day、month、date
    const { $W, $M, $D } = this
    const utcPad = `set${this.$u ? 'UTC' : ''}`
    switch (unit) {
      // year，返回1月1日或者11月31日的Dayjs实例
      case C.Y:
        return isStartOf ? instanceFactory(1, 0) :
          instanceFactory(31, 11)
      // month，返回{month+1}月1日或本月最后一天
      case C.M:
        return isStartOf ? instanceFactory(1, $M) :
          instanceFactory(0, $M + 1) // 0, $M + 1可获得上月的最后一天，避免29 30 31的区别
      // week 返回周的第一天或最后一天
      case C.W: {
        const weekStart = this.$locale().weekStart || 0
        const gap = ($W < weekStart ? $W + 7 : $W) - weekStart
        return instanceFactory(isStartOf ? $D - gap : $D + (6 - gap), $M)
      }
      // day date 返回一天的第一个小时或者最后一个小时
      case C.D:
      case C.DATE:
        return instanceFactorySet(`${utcPad}Hours`, 0)
      // hour 返回一小时的第一分钟或最后一分钟
      case C.H:
        return instanceFactorySet(`${utcPad}Minutes`, 1)
      // minute 返回一分钟的第一秒或最后一秒
      case C.MIN:
        return instanceFactorySet(`${utcPad}Seconds`, 2)
      // second 返回一秒钟的第一毫秒或最后一毫秒
      case C.S:
        return instanceFactorySet(`${utcPad}Milliseconds`, 3)
      // 默认直接返回本实例
      default:
        return this.clone()
    }
  }

  /**
   * @description: 根据单位将实例设置到一个时间段的结束
   * @param {String} units 单位
   * @return {Dayjs} 返回新的 Dayjs 实例，cfg与原实例相同
   */
  endOf(arg) {
    return this.startOf(arg, false)
  }

  /**
   * @description: 私有 setter，两个参数分别是要更新的单位和数值，调用后会返回一个修改后的新实例。
   * @param {String} units 单位
   * @param {Number} int 值
   * @return {Dayjs} 返回修改后的实例
   * @private
   */
  $set(units, int) {
    // 根据 units 处理函数名
    const unit = Utils.p(units)
    const utcPad = `set${this.$u ? 'UTC' : ''}`
    const name = {
      [C.D]: `${utcPad}Date`,
      [C.DATE]: `${utcPad}Date`,
      [C.M]: `${utcPad}Month`,
      [C.Y]: `${utcPad}FullYear`,
      [C.H]: `${utcPad}Hours`,
      [C.MIN]: `${utcPad}Minutes`,
      [C.S]: `${utcPad}Seconds`,
      [C.MS]: `${utcPad}Milliseconds`
    }[unit]
    const arg = unit === C.D ? this.$D + (int - this.$W) : int

    // 把 $d，也就是关联的 Date 对象设为对应 int
    if (unit === C.M || unit === C.Y) {
      // clone is for badMutable plugin
      const date = this.clone().set(C.DATE, 1)
      date.$d[name](arg)
      date.init()
      this.$d = date.set(C.DATE, Math.min(this.$D, date.daysInMonth())).$d
    } else if (name) this.$d[name](arg)

    // 重新初始化
    this.init()
    return this
  }

  /**
   * @description: 通用的 setter，两个参数分别是要更新的单位和数值，调用后会返回一个修改后的新实例。
   * @param {String} string 单位
   * @param {Number} int 值
   * @return {Dayjs} 返回修改后的实例
   */
  set(string, int) {
    return this.clone().$set(string, int)
  }

  /**
   * @description: 从实例中获取相应信息的通用 getter。
   * @param {String} unit
   * @return {Number} 返回对应单位的值
   */
  get(unit) {
    return this[Utils.p(unit)]()
  }

  /**
   * @description: 根据单位和值，给当前关联的Date对象增加时间
   * @param {Number} number 增加的数值
   * @param {String} units 单位
   * @return {Dayjs} 返回新的Dayjs对象
   */
  add(number, units) {
    number = Number(number) // eslint-disable-line no-param-reassign
    const unit = Utils.p(units)
    /**
     * @description: 专门给 week 和 date 用的增加时间的工具函数
     * @param {Number} n 基础单位的天数 例如 week 是 7
     * @return {Dayjs} 返回新的 Dayjs 对象
     */
    const instanceFactorySet = (n) => {
      const d = dayjs(this)
      return Utils.w(d.date(d.date() + Math.round(n * number)), this)
    }
    // 月
    if (unit === C.M) {
      return this.set(C.M, this.$M + number)
    }
    // 年
    if (unit === C.Y) {
      return this.set(C.Y, this.$y + number)
    }
    // 日
    if (unit === C.D) {
      return instanceFactorySet(1)
    }
    // 周
    if (unit === C.W) {
      return instanceFactorySet(7)
    }
    const step = {
      [C.MIN]: C.MILLISECONDS_A_MINUTE, // 分钟
      [C.H]: C.MILLISECONDS_A_HOUR, // 小时
      [C.S]: C.MILLISECONDS_A_SECOND // 秒
    }[unit] || 1 // ms

    const nextTimeStamp = this.$d.getTime() + (number * step)
    return Utils.w(nextTimeStamp, this)
  }

  /**
   * @description: 根据单位和值，给当前关联的Date对象减少时间
   * @param {Number} number 减少的数值
   * @param {String} units 单位
   * @return {Dayjs} 返回新的Dayjs对象
   */
  subtract(number, string) {
    return this.add(number * -1, string)
  }

  /**
   * @description: 根据模板返回对应格式的时间字符串
   * @param {String} formatStr 模板字符串
   * @return {String} 对应格式的时间字符串
   */
  format(formatStr) {
    if (!this.isValid()) return C.INVALID_DATE_STRING

    // 整理出所需的各种变量和方法
    const str = formatStr || C.FORMAT_DEFAULT
    const zoneStr = Utils.z(this)
    const locale = this.$locale()
    const { $H, $m, $M } = this
    const {
      weekdays, months, meridiem
    } = locale

    /**
     * @description: 返回对应缩写的字符串，可自适应
     * @param {Array} arr 几月或者周几的缩写数组 ["1月", "2月", "3月"...]
     * @param {Number} index 索引
     * @param {Array} full 几月或者周几的非缩写数组 ["一月", "二月", "三月"...]
     * @param {Number} length 返回结果的字符数
     * @return {String} 对应缩写的字符串
     */
    const getShort = (arr, index, full, length) => (
      (arr && (arr[index] || arr(this, str))) || full[index].substr(0, length)
    )

    /**
     * @description: 获取固定长度的小时表示
     * @param {Number} num 小时的长度
     * @return {String} 固定长度的小时表示
     */
    const get$H = num => (
      Utils.s($H % 12 || 12, num, '0')
    )

    /**
     * @description: 根据时和分区分时间段（上午、下午）
     * @param {Number} hour 时
     * @param {Number} minute 分
     * @param {Boolean} isLowercase 是否小写，默认false
     * @return {String} 时间段 例如 AM
     */
    const meridiemFunc = meridiem || ((hour, minute, isLowercase) => {
      const m = (hour < 12 ? 'AM' : 'PM')
      return isLowercase ? m.toLowerCase() : m
    })

    // 不同的模板对应的格式转换
    const matches = {
      YY: String(this.$y).slice(-2),
      YYYY: this.$y,
      M: $M + 1,
      MM: Utils.s($M + 1, 2, '0'),
      MMM: getShort(locale.monthsShort, $M, months, 3),
      MMMM: getShort(months, $M),
      D: this.$D,
      DD: Utils.s(this.$D, 2, '0'),
      d: String(this.$W),
      dd: getShort(locale.weekdaysMin, this.$W, weekdays, 2),
      ddd: getShort(locale.weekdaysShort, this.$W, weekdays, 3),
      dddd: weekdays[this.$W],
      H: String($H),
      HH: Utils.s($H, 2, '0'),
      h: get$H(1),
      hh: get$H(2),
      a: meridiemFunc($H, $m, true),
      A: meridiemFunc($H, $m, false),
      m: String($m),
      mm: Utils.s($m, 2, '0'),
      s: String(this.$s),
      ss: Utils.s(this.$s, 2, '0'),
      SSS: Utils.s(this.$ms, 3, '0'),
      Z: zoneStr // 'ZZ' logic below
    }

    // /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g
    // 最后进行了整个字符串模板的内容替换
    return str.replace(C.REGEX_FORMAT, (match, $1) => $1 || matches[match] || zoneStr.replace(':', '')) // 'ZZ'
  }

  /**
   * @description: 返回分钟级的时区偏移量 （精度15分钟）
   * @return {Number} 时区偏移量 分钟
   */
  utcOffset() {
    // 由于 FF24 bug，我们把时区偏移近似到 15 分钟
    // https://github.com/moment/moment/pull/1871
    return -Math.round(this.$d.getTimezoneOffset() / 15) * 15
  }

  /**
   * @description: 返回指定单位下两个日期时间之间的差异。
   * @param {String} input 输入的时间
   * @param {String} units 单位
   * @param {Boolean} float 是否需要取整
   * @return {Number} 返回对应单位下的时间差
   */
  diff(input, units, float) {
    const unit = Utils.p(units)
    // input封装成实例
    const that = dayjs(input)
    const zoneDelta = (that.utcOffset() - this.utcOffset()) * C.MILLISECONDS_A_MINUTE
    // 毫秒差
    const diff = this - that
    // 月份差
    let result = Utils.m(this, that)

    // 区分不同的单位
    result = {
      [C.Y]: result / 12,
      [C.M]: result,
      [C.Q]: result / 3,
      [C.W]: (diff - zoneDelta) / C.MILLISECONDS_A_WEEK,
      [C.D]: (diff - zoneDelta) / C.MILLISECONDS_A_DAY,
      [C.H]: diff / C.MILLISECONDS_A_HOUR,
      [C.MIN]: diff / C.MILLISECONDS_A_MINUTE,
      [C.S]: diff / C.MILLISECONDS_A_SECOND
    }[unit] || diff // milliseconds

    // 是否取整
    return float ? result : Utils.a(result)
  }

  /**
   * @description: 返回实例所在月的总天数
   * @return {Number} 天数
   */
  daysInMonth() {
    return this.endOf(C.M).$D
  }

  /**
   * @description: 当前使用的 locale 对象
   * @return {Object} locale 对象
   */
  $locale() {
    return Ls[this.$L]
  }

  /**
   * @description: 无参数时返回当前使用的locale对象，有参数时改变并设置locale对象
   * @param {String} preset locale 对象名
   * @param {Object} object locale 对象
   * @return {Object|Dayjs}
   */
  locale(preset, object) {
    // 无参数时返回当前使用的locale对象
    if (!preset) return this.$L
    const that = this.clone()
    const nextLocaleName = parseLocale(preset, object, true)
    // 有参数时改变 locale（并设置 locale 对象），后返回新 locale 的 Dayjs 实例
    if (nextLocaleName) that.$L = nextLocaleName
    return that
  }

  /**
   * @description: 克隆本实例并返回
   * @return {Dayjs} 返回新的 Dayjs 实例
   */
  clone() {
    return Utils.w(this.$d, this)
  }

  /**
   * @description: 返回实例对应的 Date 对象
   * @return {Date} Date 对象
   */
  toDate() {
    return new Date(this.valueOf())
  }

  /**
   * @description: 返回ISO格式的字符串（YYYY-MM-DDTHH:mm:ss.sssZ），不太懂
   * @return {String} UTC（协调世界时）例如 2020-12-09T05:14:04.670Z
   */
  toJSON() {
    return this.isValid() ? this.toISOString() : null
  }

  /**
   * @description: 返回ISO格式的字符串（YYYY-MM-DDTHH:mm:ss.sssZ）
   * @return {String} UTC（协调世界时）例如 2020-12-09T05:14:04.670Z
   */
  toISOString() {
    // ie 8 return
    // new Dayjs(this.valueOf() + this.$d.getTimezoneOffset() * 60000)
    // .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
    return this.$d.toISOString()
  }

  /**
   * @description: 返回一个字符串
   * @return {String} 例如"Wed, 09 Dec 2020 05:16:39 GMT"
   */
  toString() {
    return this.$d.toUTCString()
  }
}

const proto = Dayjs.prototype
dayjs.prototype = proto;

// 在prototype上设置各个单位的取值和设值函数
[
  ['$ms', C.MS],
  ['$s', C.S],
  ['$m', C.MIN],
  ['$H', C.H],
  ['$W', C.D],
  ['$M', C.M],
  ['$y', C.Y],
  ['$D', C.DATE]
].forEach((g) => {
  proto[g[1]] = function (input) {
    // g[0]是实例上的值，g[1]是字符串（例如date）
    return this.$g(input, g[0], g[1])
  }
})


// 下面的方法都是静态方法，挂在Dayjs类上
/**
 * @description: 挂载插件
 * @param {*} plugin 插件
 * @param {*} option 插件选项
 * @return {Dayjs Class} 返回Dayjs类
 */
dayjs.extend = (plugin, option) => {
  // 同一个插件只挂载一次
  if (!plugin.$i) {
    plugin(option, Dayjs, dayjs) //挂载
    plugin.$i = true
  }
  return dayjs
}

dayjs.locale = parseLocale

dayjs.isDayjs = isDayjs

/**
 * @description: 解析传入的一个秒做单位的 Unix 时间戳 (10 位数字)，返回一个 Dayjs 实例
 * @param {Number} timestamp 10位的时间戳
 * @return {Dayjs} 返回一个 Dayjs 实例 
 */
dayjs.unix = timestamp => (
  dayjs(timestamp * 1e3)
)

dayjs.en = Ls[L]
dayjs.Ls = Ls
dayjs.p = {}
export default dayjs
