const express = require('express');
const bodyParser = require('body-parser'); 
const cors = require('cors');
const forge = require('node-forge');
const sha256 = require('sha256');
const { v1 } = require('uuid'); 

let BlockChain = require('./blockchain/BlockChain')
let ConnectDB = require('./db');
let modelAddressWallet = require('./db/modelAddressWallet')
const checkWallet = require('./middleware')
let blockChain = new BlockChain()

const port = 1000
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors());
const server = require('http').createServer(app);

app.post('/create-wallet', async (req, res) => {
  const privateKey = v1().split('-').join('');
  const address = {
    private: privateKey,
    public: sha256(privateKey)
  };
  await modelAddressWallet.createAddress(address)
  await blockChain.addNewTransaction('system-admin', address.public, 1000)
  await blockChain.addNewBlock(null)
  res.json({
    status: 'ok',
    address: address.public,
    pk: privateKey
  })
})

app.get('/my-wallet', checkWallet, async (req, res) => {
  const { address = '' } = req.query
  let info = await blockChain.getAddressData(address)
  return res.json(info)
})

app.post('/mining', checkWallet, async (req, res) => {
  const { address = '' } = req.body
  await blockChain.addNewTransaction('system-admin', address, 100)
  await blockChain.addNewBlock(null, 2)
  return res.json({ status: 'success', coin: 100 })
})

app.post('/send-transaction', checkWallet, async (req, res) => {
  const { sender = '',  recipient = '', amount } = req.body
  let infoSender = await blockChain.getAddressData(sender)
  if (infoSender.addressBalance < +amount) {
    return res.json({
      status: 'error',
      message: 'Your wallet is not enough coin!!! Please'
    })
  }
  await blockChain.addNewTransaction(sender, recipient, amount)
  await blockChain.addNewTransaction('system-admin', sender, 2)
  await blockChain.addNewBlock(null)
  return res.json({
    status: 'ok',
    message: 'Send transaction success'
  })
})

app.get('/history-transaction', async (req, res) => {
  const { address = '' } = req.query
  if (address) {
    let param = {
      public: address
    }
    let result = await modelAddressWallet.getAddress(param)
    if (result.length === 0) res.json({
      status: 'error',
      message: 'Your wallet not avaible!!!!'
    })
    let info = await blockChain.getAddressData(address)
    return res.json(info)
  }
  let result = await blockChain.getAddressAllData()
  res.json(result)
})


const startSever = async () => {
  server.listen(port, async () => {
    console.log(
      `QLBH API is running on port ${port} - http://localhost:${port}`
    );
  });
};

ConnectDB().then(() => {
  console.log('MongoDb connected');

  // blockChain.addNewTransaction('sender1', 'recipient1', 1000)
  // blockChain.addNewTransaction('sender2', 'recipient2', 1000)
  // blockChain.addNewBlock(null)
  startSever();
})
.catch(err => {
  console.log('err: ', err);
})