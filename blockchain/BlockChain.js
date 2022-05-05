let hash = require('object-hash');
const { v1 } = require('uuid'); 
const sha256 = require('sha256');
const concat = require('lodash/concat')
let blockChainModel = require('../db/modelBlockChain')

class BlockChain {
  constructor() {
    this.chain = [];
    this.curr_transactions = [];
  }
}


BlockChain.prototype.getLastBlock = async function() {
  return await blockChainModel.getLastSchema()
}

BlockChain.prototype.addNewBlock = async function(prevHash, type = 1) {
  let block = {
    index: 0,
    timestamp: Date.now(),
    transactions: this.curr_transactions,
    prevHash: prevHash
  };


  const lastBlock = await this.getLastBlock()

  let nonce
  if (lastBlock) {
    block.prevHash = lastBlock.hash
    block.index = lastBlock.index + 1
    nonce = type === 1 ? this.proofOfWork(lastBlock.hash, block) : await this.mining(5, lastBlock.hash, block)
  } else {
    nonce = this.proofOfWork('', block)
  }
  
  let hash = this.hashBlock(prevHash, block, nonce)
  block.nonce = nonce
  block.hash = hash

  let result = await blockChainModel.createBlockChain(block)

  this.chain.push(result);
  this.curr_transactions = [];
  return result;
}

BlockChain.prototype.addNewTransaction = function(sender, recipient, amount) {
  this.curr_transactions.push({
    transactionId: v1().split('-').join(''),
    sender,
    recipient,
    amount
  });
}

BlockChain.prototype.proofOfWork = function(previousHash = '', currentHash) {
  let nonce = 0;
  let hash = this.hashBlock(previousHash, currentHash, nonce);
  while (hash.substring(0, 4) !== '0000') { //generate a new hash until the first 4 chars of the hash will be equals to '0000'. 
    nonce++;
    hash = this.hashBlock(previousHash, currentHash, nonce);
  }
  return nonce;
}

BlockChain.prototype.mining = async function (level, previousHash = '', currentHash) {
  let nonce = 0;
  let hash = this.hashBlock(previousHash, currentHash, nonce);
  while (hash.substring(0, level) !== Array(level + 1).join("0")) {
    nonce++;
    hash = this.hashBlock(previousHash, currentHash, nonce);

  }
  return nonce
}

BlockChain.prototype.lastBlock = async function() {
  return this.chain.slice(-1)[0]
}

BlockChain.prototype.isEmpty = async function() {
  return this.chain.length === 0
}

BlockChain.prototype.hashBlock = function(previousHash = '', block, nonce) {
  return sha256(previousHash + nonce.toString() + JSON.stringify(block))
}

BlockChain.prototype.getAddressData = async function(address) {
  let blocks = await blockChainModel.getAll()
  const addressTransactions = [];
  const addressBlocks = [];

  blocks.forEach(({timestamps, transactions, index, prevHash, hash, nonce}) => {
    transactions.forEach(transaction => {
        if (transaction.sender === address || transaction.recipient === address) {
          addressTransactions.push({...transaction, timestamps}); //push all tranasction by sender or recipient into array.
          addressBlocks.push({index, prevHash, hash, nonce, timestamps})
        };
    });
  });

  if (addressTransactions == null) return false;

  var amountArr = [];
  let balance = 0;

  addressTransactions.forEach(transaction => {
    if (transaction.recipient === address) {
      balance += transaction.amount;
      amountArr.push(balance);
    }
    else if (transaction.sender === address) {
      balance -= transaction.amount;
      amountArr.push(balance);
    }
  });

  return {
    transactions: addressTransactions,
    addressBalance: balance,
    amountArr: amountArr,
    blocks: addressBlocks
  };
}

BlockChain.prototype.getAddressAllData = async function() {
  let blocks = await blockChainModel.getLastAllSchema()
  let resultBlocks = blocks.map(({timestamps, index, prevHash, hash, nonce}) => ({timestamps, index, prevHash, hash, nonce}))
  let resultTransactions = blocks.map(({timestamps, transactions}) => transactions.map(item => ({...item, timestamps})))
  
  return {
    transactions: concat(...resultTransactions),
    blocks: resultBlocks
  }
}
module.exports = BlockChain