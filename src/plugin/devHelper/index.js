/**
 * @description: plugin  使用 Day.js 时显示一些提示和警告方便开发。
 * @param {Object} o option
 * @param {Class} c Dayjs类
 * @param {Function} d dayjs函数对象
 */
export default (o, c, d) => {
  // 非node环境或者node非生产环境下可用
  if (!process || process.env.NODE_ENV !== 'production') {
    const proto = c.prototype
    const oldParse = proto.parse
    proto.parse = function (cfg) {
      const { date } = cfg
      // 毫秒时间戳的警告
      if (typeof date === 'string' && date.length === 13) {
        console.warn(`To parse a Unix timestamp like ${date}, you should pass it as a Number. https://day.js.org/docs/en/parse/unix-timestamp-milliseconds`)
      }
      // 解析自定义格式的字符串时，提示需要装插件
      if (cfg.args.length >= 2 && !d.p.customParseFormat) {
        console.warn(`To parse a date-time string like ${date} using the given format, you should enable customParseFormat plugin first. https://day.js.org/docs/en/parse/string-format`)
      }
      return oldParse.bind(this)(cfg)
    }
  }
}

