import { FORMAT_DEFAULT } from '../../constant'
import { u, englishFormats } from './utils'

/**
 * @description: plugin
 * @param {Object} o option
 * @param {Class} c Dayjs类
 * @param {Function} d dayjs函数对象
 */
export default (o, c, d) => {
  const proto = c.prototype
  const oldFormat = proto.format

  d.en.formats = englishFormats
  /**
   * @description:  扩展了 dayjs().format API 以支持更多本地化的长日期格式。
   * @param {String} formatStr 模板字符串
   * @return {String} 返回格式化后的字符串
   */
  proto.format = function (formatStr = FORMAT_DEFAULT) {
    // 占位符	英语语言	示例输出
    // LT	h:mm A	8:02 PM
    // LTS	h:mm:ss A	8:02:18 PM
    // L	MM/DD/YYYY	08/16/2018
    // LL	MMMM D, YYYY	August 16, 2018
    // LLL	MMMM D, YYYY h:mm A	August 16, 2018 8:02 PM
    // LLLL	dddd, MMMM D, YYYY h:mm A	Thursday, August 16, 2018 8:02 PM
    // l	M/D/YYYY	8/16/2018
    // ll	MMM D, YYYY	Aug 16, 2018
    // lll	MMM D, YYYY h:mm A	Aug 16, 2018 8:02 PM
    // llll	ddd, MMM D, YYYY h:mm A	Thu, Aug 16, 2018 8:02 PM
    const { formats = {} } = this.$locale()
    const result = u(formatStr, formats)
    return oldFormat.call(this, result)
  }
}

