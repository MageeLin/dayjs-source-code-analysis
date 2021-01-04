import { MIN, MS } from '../../constant'

// 每个时间类型对应的参数位置
const typeToPos = {
  year: 0,
  month: 1,
  day: 2,
  hour: 3,
  minute: 4,
  second: 5
}

// 从 Intl.DateTimeFormat中 缓存检索的时区，因为这个方法非常慢。
const dtfCache = {}
/**
 * @description: 获取Intl.DateTimeFormat格式化后的时间
 * @param {String} timezone 时区字符串 例如 America/New_York
 * @param {Object} options 选项
 * @return {DateTimeFormat} 返回对应时区DateTimeFormat实例，主要是利用实例上的format方法
 */
const getDateTimeFormat = (timezone, options = {}) => {
  // 时区名称的展现方式，默认为short
  const timeZoneName = options.timeZoneName || 'short'
  const key = `${timezone}|${timeZoneName}`
  // 优先从缓存中拿
  let dtf = dtfCache[key]
  if (!dtf) {
    dtf = new Intl.DateTimeFormat('en-US', {
      hour12: false,
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName
    })
    dtfCache[key] = dtf
  }
  return dtf
}

/**
 * @description: plugin 添加了 dayjs.tz .tz .tz.guess .tz.setDefault API，在时区之间解析或显示。
 * @param {Object} o option
 * @param {Class} c Dayjs类
 * @param {Function} d dayjs函数对象
 */
export default (o, c, d) => {
  let defaultTimezone

  // 获取本地的UTC偏移量
  const localUtcOffset = d().utcOffset()

  /**
   * @description: 根据时间戳和时区返回格式化后的时间数组
   * @param {Number} timestamp 13位时间戳
   * @param {String} timezone 时区 举例 America/New_York
   * @param {Object} options 配置
   * @return {Array} 返回格式化后的数组 [{type,value}]
   */
  const makeFormatParts = (timestamp, timezone, options = {}) => {
    const date = new Date(timestamp)
    const dtf = getDateTimeFormat(timezone, options)
    return dtf.formatToParts(date)
  }

  /**
   * @description: 返回时区相对UTC偏移的分钟数
   * @param {Number} timestamp 13位时间戳
   * @param {String} timezone 时区 举例 America/New_York
   * @return {Number}
   */
  const tzOffset = (timestamp, timezone) => {
    const formatResult = makeFormatParts(timestamp, timezone)
    const filled = []
    for (let i = 0; i < formatResult.length; i += 1) {
      const { type, value } = formatResult[i]
      const pos = typeToPos[type]

      if (pos >= 0) {
        filled[pos] = parseInt(value, 10)
      }
    }
    // 到这一步filled数组大概为[2020, 12, 26, 4, 29, 28]的格式
    const hour = filled[3]
    // 使在不同的node版本中具有相同的表现
    // https://github.com/nodejs/node/issues/33027
    const fixedHour = hour === 24 ? 0 : hour
    // 组装成UTC格式2020-12-26 4:32:4:000
    const utcString = `${filled[0]}-${filled[1]}-${filled[2]} ${fixedHour}:${filled[4]}:${filled[5]}:000`
    // 拿到新的时间戳1608957124000
    const utcTs = d.utc(utcString).valueOf()
    let asTS = +timestamp
    const over = asTS % 1000
    asTS -= over
    // 计算出偏移的分钟数
    return (utcTs - asTS) / (60 * 1000)
  }

  // 找到给定本地时间的正确偏移量。o 输入是我们的猜测，它决定了我们在模糊情况下选择哪个偏移量(例如，有两个3 AMs b/c Fallback DST)
  // https://github.com/moment/luxon/blob/master/src/datetime.js#L76
  /**
   * @description: 修正偏移量
   * @param {Number} localTS 时间戳 1401624000000
   * @param {Number} o0 UTC偏移 -300
   * @param {String} tz 时区标志 America/New_York
   * @return {Array} 返回修正后的时间戳和偏移量 [1401638400000, -240]
   */  
  const fixOffset = (localTS, o0, tz) => {
    // UTC时间仅仅是猜测的结果，因为偏移也是个猜测
    let utcGuess = localTS - (o0 * 60 * 1000)
    // 测试时区是否匹配偏移
    const o2 = tzOffset(utcGuess, tz)
    // 如果匹配则不需要修改
    if (o0 === o2) {
      return [utcGuess, o0]
    }
    // 如果不匹配，根据偏移差来修正
    utcGuess -= (o2 - o0) * 60 * 1000
    // 如果给了给了需要的本地时间，任务完成
    const o3 = tzOffset(utcGuess, tz)
    if (o2 === o3) {
      return [utcGuess, o2]
    }
    // 如果还不同，就陷入了困境
    // 偏移改变了，但是没有调整时间
    return [localTS - (Math.min(o2, o3) * 60 * 1000), Math.max(o2, o3)]
  }

  const proto = c.prototype

  /**
   * @description: 返回一个设置好UTC偏移量的新的Dayjs实例
   * @param {String} timezone 时区标志 America/New_York
   * @param {Boolean} keepLocalTime 是否保持Local的偏移
   * @return {Dayjs} 返回一个设置好UTC偏移量的新的Dayjs实例
   */
  proto.tz = function (timezone = defaultTimezone, keepLocalTime) {
    const oldOffset = this.utcOffset()
    // 利用原生的Date对象
    const target = this.toDate().toLocaleString('en-US', { timeZone: timezone })
    const diff = Math.round((this.toDate() - new Date(target)) / 1000 / 60)
    // 给实例设置UTC偏移量
    let ins = d(target).$set(MS, this.$ms).utcOffset(localUtcOffset - diff, true)
    // 如果需要保持本地时间，就再修正偏移
    if (keepLocalTime) {
      const newOffset = ins.utcOffset()
      ins = ins.add(oldOffset - newOffset, MIN)
    }
    ins.$x.$timezone = timezone
    return ins
  }

  /**
   * @description: 获取偏移的名字，比如 short：EDT，long：Eastern Daylight Time
   * @param {String} type short / long
   * @return {String} 
   */
  proto.offsetName = function (type) {
    // type: short(default) / long
    const zone = this.$x.$timezone || d.tz.guess()
    const result = makeFormatParts(this.valueOf(), zone, { timeZoneName: type }).find(m => m.type.toLowerCase() === 'timezonename')
    return result && result.value
  }

  const oldStartOf = proto.startOf
  /**
   * @description: 扩展startOf，根据单位将实例设置到一个时间段的开始
   * @param {String} units 单位
   * @param {Boolean} startOf 标志，true:startOf, false: endOf
   * @return {Dayjs} 返回新的 Dayjs 实例，cfg与原实例相同
   */
  proto.startOf = function (units, startOf) {
    if (!this.$x || !this.$x.$timezone) {
      return oldStartOf.call(this, units, startOf)
    }

    const withoutTz = d(this.format('YYYY-MM-DD HH:mm:ss:SSS'))
    const startOfWithoutTz = oldStartOf.call(withoutTz, units, startOf)
    return startOfWithoutTz.tz(this.$x.$timezone, true)
  }


  /**
   * 下面的几个方法都加在了dayjs函数对象上
   * @description: 返回一个设置好UTC偏移量的新的Dayjs实例
   * @param {String|Number|Date|Dayjs} input
   * @param {String} arg1 举例 America/New_York
   * @param {String} arg2
   * @return {Dayjs} 返回一个设置好UTC偏移量的新的Dayjs实例
   */
  d.tz = function (input, arg1, arg2) {
    const parseFormat = arg2 && arg1
    const timezone = arg2 || arg1 || defaultTimezone
    const previousOffset = tzOffset(+d(), timezone)
    if (typeof input !== 'string') {
      // timestamp number || js Date || Day.js
      return d(input).tz(timezone)
    }
    const localTs = d.utc(input, parseFormat).valueOf()
    const [targetTs, targetOffset] = fixOffset(localTs, previousOffset, timezone)
    const ins = d(targetTs).utcOffset(targetOffset)
    ins.$x.$timezone = timezone
    return ins
  }

  /**
   * @description: 利用 Intl.DateTimeFormat().resolvedOptions()返回的对象中的 timeZone 来猜时区
   * @return {String} 返回 timeZone 标志字符串
   */
  d.tz.guess = function () {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  }

  /**
   * @description: 设置默认的时区
   * @param {String} timeZone 时区标志字符串
   */
  d.tz.setDefault = function (timezone) {
    defaultTimezone = timezone
  }
}
