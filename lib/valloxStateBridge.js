module.exports = class ValloxStateBridge {
    /**
     * @param {string} vlxDevConstant
     * @param {string} ioBrokerConfigPath
     * @param {string} dataType
     * @param {string} role
     * @param {boolean} allowWrite
     */
    constructor(vlxDevConstant, ioBrokerConfigPath, dataType, role, allowWrite) {
      this.VlxDevConstant = vlxDevConstant;
      this.IoBrokerConfigPath =  ioBrokerConfigPath;
      this.DataType = dataType;
      this.Role = role;
      this.AllowWrite = allowWrite;
      
    }

    
  }