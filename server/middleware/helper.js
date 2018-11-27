import fs from 'fs';


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

  static generateId() {
    const { users } = JSON.parse(fs.readFileSync('users.json'));
    const ids = users.map(user => user.id);
    if (users.length < 1) return 1;
    const idSorted = ids.sort((a, b) => a - b);
    const indexOfLastItem = idSorted.length - 1;
    const newId = 1 + idSorted[indexOfLastItem];
    return newId;
  }

}// END HelperValidator

export default Helper;
