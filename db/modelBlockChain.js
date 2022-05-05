let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let BlockChainSchema = new Schema({
  index: {
    required: false,
    type: Schema.Types.Number
  },
  timestamps: {
    required: false,
    type: Schema.Types.Date,
    default: Date.now()
  },
  transactions: {
    required: false,
    type: Schema.Types.Array
  },
  prevHash: {
    required: false,
    type: Schema.Types.String
  },
  hash: {
    required: false,
    type: Schema.Types.String
  },
  nonce: {
    required: false,
    type: Schema.Types.Number
  }
},
{versionKey: false})

let Collection = mongoose.model('BlockChain', BlockChainSchema, 'blockChains')

module.exports = {
  createBlockChain: async function (lamda) {
    return await Collection.insertMany(lamda)
  },
  getLastSchema: async function () {
    return await Collection.findOne({}, null, { sort: { _id: -1 }, limit: 1 })
  },
  getAll: async function () {
    return await Collection.find()
  },
  getLastAllSchema: async function () {
    return await Collection.find({}, null, { sort: { _id: -1 }, limit: 10 })
  }
}