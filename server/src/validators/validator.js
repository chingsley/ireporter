// import pool from '../db/config';
import emailChecker from './emailChecker';

/**
 * class Validator contains the validator functions
 */
class Validator {
  /**
   *
   * @param {string} id the id of record (red-flag or intervention)
   * @returns {boolean} true or false
   */
  static isValidRecordId(id) {
    if (Number.isNaN(Number(id))) return false;
    if (!Number.isInteger(Number(id))) return false;
    if ((Number(id) < 0)) return false;
    return true;
  }

  /**
   * @param {string} email user email
   * @returns {object} contains info about what is wrong with the mail
   */
  static customValidateEmail(email) {
    return emailChecker.verifyEmail(email.toString().trim());
  }

  /**
 *
 * @param {stromg} password
 * @return {boolean} true or false
 */
  static isPasswordTooShort(password) {
    if (!password) return false;
    return password.toString().trim().length < 6;
  }

  /**
   *
   * @param {string} name could be first name or last name
   * @returns {boolean} true or false
   */
  static isValidName(name) {
    if (!name) return false;
    for (let i = 0; i < name.length; i += 1) {
      if (!Number.isNaN(Number(name))) return false;
    }
    return name.toString().trim().length >= 2;
  }

  /**
   *
   * @param {string} phoneNumber user phone number
   * @return {boolean} true or false
   */
  static isValidPhoneNumber(phoneNumber) {
    if (!phoneNumber) return false;
    if (Number(phoneNumber) === 0) return false;
    if (phoneNumber.toString().trim().length < 3) return false;
    if (phoneNumber[0] !== '+' && !Number.isInteger(Number(phoneNumber[0]))) return false;
    const number = phoneNumber.toString().trim();
    const arr = number.split('');
    if (arr.length > 15) return false;
    for (let i = 0; i < arr.length; i += 1) {
      if (Number.isNaN(Number(arr[i])) && arr[i] !== ' ' && arr[i] !== '+' && arr[i] !== '-') {
        return false;
      }
    }
    return true;
  }

  /**
   *
   * @param {string} location 'lat, long'
   * @returns {boolean} true or false
   */
  static isValidCoordinates(location) {
    if (!location) return false;
    if (location && location.toString().trim() === '') return false;
    let trimmedLocation;
    if (location) {
      trimmedLocation = location.toString().trim();
    }
    const arr = trimmedLocation.split(',');
    const [lat, lng] = arr;

    if (arr.length !== 2) return false;
    if (Number.isNaN(Number(lat)) || Number.isNaN(Number(lng))) return false;
    if (Number(lat) < -90 || Number(lat) > 90) return false;
    if (Number(lng) < -180 || Number(lng) > 180) return false;

    return true;
  }

  /**
   *
   * @param {string} comment a user's comment
   * @returns {boolean} true or false
   */
  static isValidComment(comment) {
    if (!comment) return false;
    if (!Number.isNaN(Number(comment))) return false;
    if (comment.toString().trim() === '') return false;
    const arr = comment.toString().trim().split(' ');
    const arrOfActualWords = [];
    for (let i = 0; i < arr.length; i += 1) {
      arr[i] = arr[i].toString().trim();
      if (arr[i] !== '' && Number.isNaN(Number(arr[i]))) {
        arrOfActualWords.push(arr[i]);
      }
    }
    return arrOfActualWords.length > 2;
  }

  /**
   *
   * @param {string} status the status of the record
   * @returns {boolean} true or false
   */
  static isValidStatus(status) {
    if (!status) return false;
    if (status.toString().trim() === '') return false;
    status = status.toLowerCase().trim();
    if (status !== 'draft' && status !== 'under investigation' && status !== 'rejected' && status !== 'resolved') {
      return false;
    }
    return true;
  }

  // static isValidFileFormat(req) {
  //   return req.fileFormatError ? false : true;
  // }
}

export default Validator;
