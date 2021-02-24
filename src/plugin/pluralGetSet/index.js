/**
 * @description: plugin
 * @param {Object} o option
 * @param {Class} c Dayjs类
 */
export default (o, c) => {
  const proto = c.prototype

  const pluralAliases = [
    'milliseconds',
    'seconds',
    'minutes',
    'hours',
    'days',
    'weeks',
    'isoWeeks',
    'months',
    'quarters',
    'years',
    'dates'
  ]
  // 在prototype上给每个单位添加复数形式方法，与非复数同名函数一致
  pluralAliases.forEach((alias) => {
    proto[alias] = proto[alias.replace(/s$/, '')]
  })
}
