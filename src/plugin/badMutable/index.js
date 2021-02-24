/**
 * @description: plugin  Day.js 被设计成不可变的对象，
 * 但是为了方便一些老项目实现对 moment.js 的替换，
 * 可以使用🚨 BadMutable 🚨插件让 Day.js 转变成可变的对象
 * @param {Object} o option
 * @param {Class} c Dayjs类
 */
export default (o, c) => {
  // 在本质上，就是所有的 setter 都会更新当前实例，this都是绑到了当前实例上
  const proto = c.prototype
  proto.$g = function (input, get, set) {
    if (this.$utils().u(input)) return this[get]
    return this.$set(set, input)
  }

  proto.set = function (string, int) {
    return this.$set(string, int)
  }

  const oldStartOf = proto.startOf
  proto.startOf = function (units, startOf) {
    this.$d = oldStartOf.bind(this)(units, startOf).toDate()
    this.init()
    return this
  }

  const oldAdd = proto.add
  proto.add = function (number, units) {
    this.$d = oldAdd.bind(this)(number, units).toDate()
    this.init()
    return this
  }

  const oldLocale = proto.locale
  proto.locale = function (preset, object) {
    if (!preset) return this.$L
    this.$L = oldLocale.bind(this)(preset, object).$L
    return this
  }

  const oldDaysInMonth = proto.daysInMonth
  proto.daysInMonth = function () {
    return oldDaysInMonth.bind(this.clone())()
  }

  const oldIsSame = proto.isSame
  proto.isSame = function (that, units) {
    return oldIsSame.bind(this.clone())(that, units)
  }

  const oldIsBefore = proto.isBefore
  proto.isBefore = function (that, units) {
    return oldIsBefore.bind(this.clone())(that, units)
  }

  const oldIsAfter = proto.isAfter
  proto.isAfter = function (that, units) {
    return oldIsAfter.bind(this.clone())(that, units)
  }
}

