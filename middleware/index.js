let modelAddressWallet = require('../db/modelAddressWallet')
const sha256 = require('sha256');

const checkWallet = async (req, res, next) => {
  try {
    let { address, sender } = req.body.address || req.body.sender ? req.body : req.query
    const addressCurrent = address ? address : sender
    let param = {
      public: addressCurrent
    }
    let result = await modelAddressWallet.getAddress(param)
    if (result.length === 0) {
      return res.json({
        status: 'error',
        message: 'Your wallet not avaible!!!!'
      })
    } else {
      next();
    }
  } catch (err) { console.log(err) }
}

module.exports = checkWallet