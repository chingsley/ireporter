import fs from 'fs';
import {
  usersDotJason,
  redflagsDotJason,
} from '../storage/config';

class Helper {
  static isValidPassword(password) {
    return password.trim().length > 5;
  }

  static isValidName(name) {
    return name.trim().length > 1;
  }

  static isArray(value) {
    return Array.isArray(value);
  }

  static isValidId(id) {
    return !(Number.isNaN(Number(id)));
  }

  static isValidComment(comment) {
    // example of a valid comment: "I was cheated" : 3 words
    return (comment.split(' ').length > 2)
  }

  static generateUserId() {
    const { users } = JSON.parse(fs.readFileSync(usersDotJason));
    const ids = users.map(user => user.id);
    if (users.length < 1) return 1;
    const idSorted = ids.sort((a, b) => a - b);
    const indexOfLastItem = idSorted.length - 1;
    const newId = 1 + idSorted[indexOfLastItem];
    return newId;
  }

  static generateRedflagId() {
    const { redflags } = JSON.parse(fs.readFileSync(redflagsDotJason));
    const ids = redflags.map(redflag => redflag.id);
    if (redflags.length < 1) return 1;
    const idSorted = ids.sort((a, b) => a - b);
    const indexOfLastItem = idSorted.length - 1;
    const newId = 1 + idSorted[indexOfLastItem];
    return newId;
  }

  // static async isRegisteredUser(email) {
  //   const { users } = JSON.parse(fs.readFileSync(usersDotJason));
  //   const user = users.filter(user => user.email.trim() === email.trim());
  //   return (user.length > 1) ? true : false;
  // }

}// END HelperValidator

export default Helper;
