module.exports = class ValloxStateBridge {
    /**     
     * @param {string} ioBrokerConfigPath
     * @param {string} vlxDevConstant
     * @param {string} description
     * @param {string} dataType
     * @param {string} role
     * @param {boolean} allowWrite
     */
    constructor( ioBrokerConfigPath, vlxDevConstant, description, dataType, role, allowWrite) {    
      this.IoBrokerConfigPath =  ioBrokerConfigPath;
      this.VlxDevConstant = vlxDevConstant;
      this.DataType = dataType;
      this.Description = description;
      this.Role = role;
      this.AllowWrite = allowWrite;
      
    }

    
  }