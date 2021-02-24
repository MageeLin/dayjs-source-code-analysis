import { Q, M, D } from '../../constant'

/**
 * @description: plugin 增加了 .quarter() API 返回当前实例是哪个季度
 * @param {Object} o option
 * @param {Class} c Dayjs类
 */
export default (o, c) => {
  const proto = c.prototype
  /**
   * @description: quarter单位的getter/setter
   * @param {Number|Undefined} quarter 第几季度
   * @return {Number|Dayjs} getter时，返回第几季度，setter时，返回Dayjs实例
   */
  proto.quarter = function (quarter) {
    if (!this.$utils().u(quarter)) {
      // 使用的时month来转化
      return this.month((this.month() % 3) + ((quarter - 1) * 3))
    }
    return Math.ceil((this.month() + 1) / 3)
  }

  const oldAdd = proto.add
  /**
   * @description: 扩展add方法，支持季度
   * @param {Number} number 数值
   * @param {String} units 单位
   * @return {Dayjs} 返回新的Dayjs实例
   */
  proto.add = function (number, units) {
    number = Number(number) // eslint-disable-line no-param-reassign
    const unit = this.$utils().p(units)
    if (unit === Q) {
      // 同样是转化成月份来计算的
      return this.add(number * 3, M)
    }
    return oldAdd.bind(this)(number, units)
  }

  const oldStartOf = proto.startOf
  /**
   * @description: 扩展startOf方法，支持季度
   * @param {String} units 单位
   * @param {Boolean} startOf 标志开始还是结束
   * @return {Dayjs} 返回新的Dayjs实例
   */
  proto.startOf = function (units, startOf) {
    const utils = this.$utils()
    const isStartOf = !utils.u(startOf) ? startOf : true
    const unit = utils.p(units)
    if (unit === Q) {
      const quarter = this.quarter() - 1
      // 转化为月份计算
      return isStartOf ? this.month(quarter * 3)
        .startOf(M).startOf(D) :
        this.month((quarter * 3) + 2).endOf(M).endOf(D)
    }
    return oldStartOf.bind(this)(units, startOf)
  }
}
