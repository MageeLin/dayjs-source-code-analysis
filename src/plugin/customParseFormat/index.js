// 拓展了 dayjs() 支持自定义时间格式
import { u } from '../localizedFormat/utils'

// 正则
const formattingTokens = /(\[[^[]*\])|([-:/.()\s]+)|(A|a|YYYY|YY?|MM?M?M?|Do|DD?|hh?|HH?|mm?|ss?|S{1,3}|z|ZZ?)/g

// 注释为要匹配的值的样子
const match1 = /\d/ // 0 - 9
const match2 = /\d\d/ // 00 - 99
const match3 = /\d{3}/ // 000 - 999
const match4 = /\d{4}/ // 0000 - 9999
const match1to2 = /\d\d?/ // 0 - 99
const matchSigned = /[+-]?\d+/ // -inf - inf
const matchOffset = /[+-]\d\d:?(\d\d)?/ // +00:00 -00:00 +0000 or -0000 +00
const matchWord = /\d*[^\s\d-:/()]+/ // Word

let locale

/**
 * @description: 把时区偏移转为 分钟数 数字
 * @param {String} string Z 举例 -05:00
 * @return {Number} 返回时区偏移的分钟数 举例 300
 */
function offsetFromString(string) {
  if (!string) return 0
  // 正则匹配后parts为[符号,小时,分钟]
  const parts = string.match(/([+-]|\d\d)/g)
  const minutes = +(parts[1] * 60) + (+parts[2] || 0)
  // 返回偏移的正负分钟数
  return minutes === 0 ? 0 : parts[0] === '+' ? -minutes : minutes // eslint-disable-line no-nested-ternary
}

/**
 * @description: 不同单位的add函数工厂，举例 addInput('seconds')
 * @param {String} property 属性名 举例 seconds
 * @return {Function} 返回一个函数，这个函数修改指定单位
 */
const addInput = function (property) {
  return function (input) {
    this[property] = +input
  }
}

/**
 * @description: 数组的第二个元素是一个函数，这个函数设置this.zone.offset为时区偏移的分钟数
 * @param {String} input
 */
const zoneExpressions = [matchOffset, function (input) {
  const zone = this.zone || (this.zone = {})
  zone.offset = offsetFromString(input)
}]

/**
 * @description: 获取locale的某部分
 * @param {String} name 键名  举例 months
 * @return {} 返回locale的指定部分 举例 ["January", "February", "March", ...]
 */
const getLocalePart = (name) => {
  const part = locale[name]
  return part && (
    part.indexOf ? part : part.s.concat(part.f)
  )
}

/**
 * @description: 判断是否为下午
 * @param {String} input 时间段 举例 PM
 * @param {Boolean} isLowerCase 是否小写
 * @return {Boolean} 返回是否为下午
 */
const meridiemMatch = (input, isLowerCase) => {
  let isAfternoon
  const { meridiem } = locale
  if (!meridiem) {
    isAfternoon = input === (isLowerCase ? 'pm' : 'PM')
  } else {
    for (let i = 1; i <= 24; i += 1) {
      // 在meridiem中匹配，大于12点则为下午
      if (input.indexOf(meridiem(i, 0, isLowerCase)) > -1) {
        isAfternoon = i > 12
        break
      }
    }
  }
  return isAfternoon
}

// 存放各个表达式， {token1: [regex, parser], token2: [regex, parser]}
const expressions = {
  // 上午 下午 大写
  A: [matchWord, function (input) {
    this.afternoon = meridiemMatch(input, false)
  }],
  // 上午 下午 小写
  a: [matchWord, function (input) {
    this.afternoon = meridiemMatch(input, true)
  }],
  // 毫秒，一位数
  S: [match1, function (input) {
    this.milliseconds = +input * 100
  }],
  // 毫秒，两位数
  SS: [match2, function (input) {
    this.milliseconds = +input * 10
  }],
  // 毫秒，三位数
  SSS: [match3, function (input) {
    this.milliseconds = +input
  }],
  // 秒
  s: [match1to2, addInput('seconds')],
  // 秒 两位数
  ss: [match1to2, addInput('seconds')],
  // 分钟
  m: [match1to2, addInput('minutes')],
  // 分钟，两位数
  mm: [match1to2, addInput('minutes')],
  // 小时
  H: [match1to2, addInput('hours')],
  // 小时, 12 小时制
  h: [match1to2, addInput('hours')],
  // 小时，两位数
  HH: [match1to2, addInput('hours')],
  // 小时, 12 小时制, 两位数
  hh: [match1to2, addInput('hours')],
  // 月份里的一天
  D: [match1to2, addInput('day')],
  // 月份里的一天，两位数
  DD: [match2, addInput('day')],
  // 带序数词的月份里的一天
  Do: [matchWord, function (input) {
    const { ordinal } = locale;
    [this.day] = input.match(/\d+/)
    if (!ordinal) return
    for (let i = 1; i <= 31; i += 1) {
      if (ordinal(i).replace(/\[|\]/g, '') === input) {
        this.day = i
      }
    }
  }],
  // 月份，从 1 开始
  M: [match1to2, addInput('month')],
  // 月份，两位数
  MM: [match2, addInput('month')],
  // 缩写的月份名称
  MMM: [matchWord, function (input) {
    const months = getLocalePart('months')
    const monthsShort = getLocalePart('monthsShort')
    const matchIndex = (monthsShort || months.map(_ => _.substr(0, 3))).indexOf(input) + 1
    if (matchIndex < 1) {
      throw new Error()
    }
    this.month = (matchIndex % 12) || matchIndex
  }],
  // 完整的月份名称
  MMMM: [matchWord, function (input) {
    const months = getLocalePart('months')
    const matchIndex = months.indexOf(input) + 1
    if (matchIndex < 1) {
      throw new Error()
    }
    this.month = (matchIndex % 12) || matchIndex
  }],
  Y: [matchSigned, addInput('year')],
  // 两位数的年份
  YY: [match2, function (input) {
    input = +input
    this.year = input + (input > 68 ? 1900 : 2000)
  }],
  // 四位数的年份
  YYYY: [match4, addInput('year')],
  // UTC 的偏移量
  Z: zoneExpressions,
  // UTC 的偏移量，两位数
  ZZ: zoneExpressions
}

/**
 * @description: 将下午的12小时制修正为正确的24小时
 * @param {Object} time 时间对象{day,hours,minutes,month,seconds,year,zone}
 */
function correctHours(time) {
  const { afternoon } = time
  if (afternoon !== undefined) {
    const { hours } = time
    // 当时间为下午时，修正为正确的24小时
    if (afternoon) {
      if (hours < 12) {
        time.hours += 12
      }
    } else if (hours === 12) {
      time.hours = 0
    }
    // 最后删掉afternoon的标志
    delete time.afternoon
  }
}

/**
 * @description: 生成一个解析器函数
 * @param {String} format 时间模板 举例 MMM/DD/YY H:mm:ss A Z
 * @return {Function} 返回新生成的解析器
 */
function makeParser(format) {
  format = u(format, locale && locale.formats)
  const array = format.match(formattingTokens)
  const { length } = array
  for (let i = 0; i < length; i += 1) {
    const token = array[i]
    const parseTo = expressions[token]
    const regex = parseTo && parseTo[0]
    const parser = parseTo && parseTo[1]
    if (parser) {
      array[i] = { regex, parser }
    } else {
      array[i] = token.replace(/^\[|\]$/g, '')
    }
  }
  // 到了这一步，array是[{regex, parser}]

  /**
   * @description: 解析器，输入对应格式时间字符串，返回time对象
   * @param {String} input 例如 Jan/02/69 1:02:03 PM -05:00
   * @return {Object} 返回time对象
   */
  return function (input) {
    const time = {}
    // 迭代着去匹配替换
    for (let i = 0, start = 0; i < length; i += 1) {
      const token = array[i]
      if (typeof token === 'string') {
        start += token.length
      } else {
        const { regex, parser } = token
        const part = input.substr(start)
        const match = regex.exec(part)
        const value = match[0]
        parser.call(time, value)
        input = input.replace(value, '')
      }
    }
    // 修正时间
    correctHours(time)
    // 返回时间对象
    return time
  }
}

/**
 * @description: 利用时间字符串和模板来解析出Date对象
 * @param {String} input Jan/02/69 1:02:03 PM -05:00
 * @param {String} format MMM/DD/YY H:mm:ss A Z
 * @param {Boolean} utc 是否为UTC
 * @return {Date} 返回对应的时间对象
 */
const parseFormattedInput = (input, format, utc) => {
  try {
    // 用模板生成解析器
    const parser = makeParser(format)
    // 解析器去解析时间字符串，生成time对象
    const {
      year, month, day, hours, minutes, seconds, milliseconds, zone
    } = parser(input)
    // 缺省值
    const now = new Date()
    const d = day || ((!year && !month) ? now.getDate() : 1)
    const y = year || now.getFullYear()
    let M = 0
    if (!(year && !month)) {
      M = month > 0 ? month - 1 : now.getMonth()
    }
    const h = hours || 0
    const m = minutes || 0
    const s = seconds || 0
    const ms = milliseconds || 0
    // 返回对应Date对象
    if (zone) {
      return new Date(Date.UTC(y, M, d, h, m, s, ms + (zone.offset * 60 * 1000)))
    }
    if (utc) {
      return new Date(Date.UTC(y, M, d, h, m, s, ms))
    }
    return new Date(y, M, d, h, m, s, ms)
  } catch (e) {
    return new Date('') // Invalid Date
  }
}

/**
 * @description: plugin  
 * @param {Object} o option
 * @param {Class} c Dayjs类
 * @param {Function} d dayjs函数对象
 */
export default (o, C, d) => {
  d.p.customParseFormat = true
  const proto = C.prototype
  const oldParse = proto.parse
  /**
   * @description: 扩展parse方法
   * @param {Object} cfg config对象
   */
  proto.parse = function (cfg) {
    const {
      date,
      utc,
      args
    } = cfg
    this.$u = utc
    const format = args[1]
    // format为字符串时
    if (typeof format === 'string') {
      const isStrictWithoutLocale = args[2] === true
      const isStrictWithLocale = args[3] === true
      const isStrict = isStrictWithoutLocale || isStrictWithLocale
      let pl = args[2]
      if (isStrictWithLocale) [,, pl] = args
      if (!isStrictWithoutLocale) {
        locale = pl ? d.Ls[pl] : this.$locale()
      }
      // 解析出Date对象
      this.$d = parseFormattedInput(date, format, utc)
      this.init()
      if (pl && pl !== true) this.$L = this.locale(pl).$L
      if (isStrict && date !== this.format(format)) {
        this.$d = new Date('')
      }
      // reset global locale to make parallel unit test
      locale = undefined
    // format为数组时
    } else if (format instanceof Array) {
      const len = format.length
      for (let i = 1; i <= len; i += 1) {
        args[1] = format[i - 1]
        const result = d.apply(this, args)
        if (result.isValid()) {
          this.$d = result.$d
          this.$L = result.$L
          this.init()
          break
        }
        if (i === len) this.$d = new Date('')
      }
    } else {
      // 普通情况还是走老的的parse
      oldParse.call(this, cfg)
    }
  }
}
