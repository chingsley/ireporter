/**
   * Determines whether the record type is red-flag or intervention
   */
class getRecordType {
  /**
   * Determines the type of record
   * @param {object} req
   * @param {object} res
   * @param {method} next
   * @returns {method} next()
   */
  static getRecordType(req, res, next) {
    const recordType = (req.baseUrl.indexOf('red-flags') > -1) ? 'red-flag' : 'intervention';

    req.recordType = recordType;
    next();
  }
}
export default getRecordType;
