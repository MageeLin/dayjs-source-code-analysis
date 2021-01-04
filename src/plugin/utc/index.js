import { MILLISECONDS_A_MINUTE, MIN } from '../../constant'

/**
 * @description: plugin 增加了 .utc .local .isUTC APIs 使用 UTC 模式来解析和展示时间。
 * @param {Object} option option
 * @param {Class} Dayjs Dayjs类
 * @param {Function} dayjs dayjs函数对象
 */
export default (option, Dayjs, dayjs) => {
  const proto = Dayjs.prototype
  /**
   * @description: 返回一个新的包含 UTC 模式标记的 Dayjs 实例。
   * @param {Date} date Date对象
   * @return {Dayjs} 返回一个Dayjs实例
   */
  dayjs.utc = function (date) {
    // 关键在于utc: true
    const cfg = { date, utc: true, args: arguments }
    return new Dayjs(cfg)
  }

  /**
   * @description: 返回一个新的包含 UTC 模式标记的 Dayjs 实例。
   * @param {Boolean} keepLocalTime 是否用本地时间
   * @return {Dayjs} 返回一个Dayjs实例
   */
  proto.utc = function (keepLocalTime) {
    const ins = dayjs(this.toDate(), { locale: this.$L, utc: true })
    if (keepLocalTime) {
      return ins.add(this.utcOffset(), MIN)
    }
    return ins
  }

  /**
   * @description: 返回一个复制的包含使用本地时区标记的 Dayjs 对象。
   * @return {Dayjs} 返回一个Dayjs实例
   */
  proto.local = function () {
    // 关键是utc为false
    return dayjs(this.toDate(), { locale: this.$L, utc: false })
  }

  const oldParse = proto.parse
  /**
   * @description: 解析cfg
   * @param {Object} cfg config 配置对象
   */
  proto.parse = function (cfg) {
    // utc模式时$u设成true
    if (cfg.utc) {
      this.$u = true
    }
    // 把偏移量设到$offset中
    if (!this.$utils().u(cfg.$offset)) {
      this.$offset = cfg.$offset
    }
    oldParse.call(this, cfg)
  }

  const oldInit = proto.init
  /**
   * @description: 初始化内部变量
   */
  proto.init = function () {
    // utc模式时
    if (this.$u) {
      const { $d } = this
      this.$y = $d.getUTCFullYear()
      this.$M = $d.getUTCMonth()
      this.$D = $d.getUTCDate()
      this.$W = $d.getUTCDay()
      this.$H = $d.getUTCHours()
      this.$m = $d.getUTCMinutes()
      this.$s = $d.getUTCSeconds()
      this.$ms = $d.getUTCMilliseconds()
    } else {
      oldInit.call(this)
    }
  }

  const oldUtcOffset = proto.utcOffset
  /**
   * @description: UTC偏移的getter和setter。
   * @param {String} input 输入的时间
   * @param {Boolean} keepLocalTime 是否用本地时间
   * @return {Dayjs|Number} setter:返回一个Dayjs实例,getter:返回偏移的分钟数
   */
  proto.utcOffset = function (input, keepLocalTime) {
    const { u } = this.$utils()
    // getter
    if (u(input)) {
      if (this.$u) {
        return 0
      }
      if (!u(this.$offset)) {
        return this.$offset
      }
      return oldUtcOffset.call(this)
    }
    // setter
    const offset = Math.abs(input) <= 16 ? input * 60 : input
    let ins = this
    if (keepLocalTime) {
      ins.$offset = offset
      ins.$u = input === 0
      return ins
    }
    if (input !== 0) {
      const localTimezoneOffset = this.$u
        ? this.toDate().getTimezoneOffset() : -1 * this.utcOffset()
      ins = this.local().add(offset + localTimezoneOffset, MIN)
      ins.$offset = offset
      ins.$x.$localOffset = localTimezoneOffset
    } else {
      ins = this.utc()
    }
    return ins
  }

  const oldFormat = proto.format
  const UTC_FORMAT_DEFAULT = 'YYYY-MM-DDTHH:mm:ss[Z]'
   /**
   * @description: 根据模板返回对应格式的时间字符串
   * @param {String} formatStr 模板字符串
   * @return {String} 对应格式的时间字符串
   */
  proto.format = function (formatStr) {
    // 默认是 YYYY-MM-DDTHH:mm:ss[Z]
    const str = formatStr || (this.$u ? UTC_FORMAT_DEFAULT : '')
    return oldFormat.call(this, str)
  }

  /**
   * @description: 根据实例关联的Date对象返回13位时间戳 ms 
   * @return {Number} 时间戳 eg.1607404331806
   */
  proto.valueOf = function () {
    const addedOffset = !this.$utils().u(this.$offset)
      ? this.$offset + (this.$x.$localOffset || (new Date()).getTimezoneOffset()) : 0
    // UTC 模式下修正偏移
    return this.$d.valueOf() - (addedOffset * MILLISECONDS_A_MINUTE)
  }

  /**
   * @description: 返回一个 boolean 来展示当前 Day.js 对象是不是在 UTC 模式下。
   * @return {Boolean} 
   */
  proto.isUTC = function () {
    return !!this.$u
  }

  /**
   * @description: 返回ISO格式的字符串（YYYY-MM-DDTHH:mm:ss.sssZ）
   * @return {String} UTC（协调世界时）例如 2020-12-09T05:14:04.670Z
   */
  proto.toISOString = function () {
    return this.toDate().toISOString()
  }

  /**
   * @description: 返回一个字符串
   * @return {String} 例如"Wed, 09 Dec 2020 05:16:39 GMT"
   */
  proto.toString = function () {
    return this.toDate().toUTCString()
  }

  const oldToDate = proto.toDate
  /**
   * @description: 返回关联的Date对象
   * @param {String} s 类型标志
   * @return {Date} 
   */
  proto.toDate = function (type) {
    if (type === 's' && this.$offset) {
      return dayjs(this.format('YYYY-MM-DD HH:mm:ss:SSS')).toDate()
    }
    return oldToDate.call(this)
  }
  const oldDiff = proto.diff
  /** 
   * @description: 返回指定单位下两个日期时间之间的差异。
   * @param {String} input 输入的时间
   * @param {String} units 单位
   * @param {Boolean} float 是否需要取整
   * @return {Number} 返回对应单位下的时间差
   */
  proto.diff = function (input, units, float) {
    if (input && this.$u === input.$u) {
      return oldDiff.call(this, input, units, float)
    }
    const localThis = this.local()
    const localInput = dayjs(input).local()
    return oldDiff.call(localThis, localInput, units, float)
  }
}
