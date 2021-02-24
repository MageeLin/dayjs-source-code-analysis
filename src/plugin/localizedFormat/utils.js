/**
 * @description: 替换模板字符串子函数
 * @param {String} format 模板字符串
 * @return {String} 返回替换后的新字符串
 */
export const t = format =>
  format.replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g, (_, a, b) => a || b.slice(1))

// 英语格式化文本
export const englishFormats = {
  LTS: 'h:mm:ss A',
  LT: 'h:mm A',
  L: 'MM/DD/YYYY',
  LL: 'MMMM D, YYYY',
  LLL: 'MMMM D, YYYY h:mm A',
  LLLL: 'dddd, MMMM D, YYYY h:mm A'
}

/**
 * @description: 替换模板字符串
 * @param {String} formatStr 模板字符串 举例 MMM/DD/YY H:mm:ss A Z
 * @param {Object} formats 每种语言的formats模板对象
 * @return {String} 返回替换后的新字符串
 */
export const u = (formatStr, formats) => formatStr.replace(/(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g, (_, a, b) => {
  const B = b && b.toUpperCase()
  // 优先级排序： 1. a匹配到的字符串 2. 对应语言的formats[b] 3.英语的englishFormats[b] 4. t(formats[B]
  return a || formats[b] || englishFormats[b] || t(formats[B])
})
