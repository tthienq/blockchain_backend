let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let AddressWalletSchema = new Schema({
  private: {
    required: false,
    type: Schema.Types.String
  },
  public: {
    required: false,
    type: Schema.Types.String
  }
},
{versionKey: false})

let Collection = mongoose.model('AddressWallet', AddressWalletSchema, 'addressWallets')

module.exports = {
  createAddress: async function (lamda) {
    return await Collection.insertMany(lamda)
  },
  getAddress: async function (lamda) {
    return await Collection.find(lamda)
  }
}