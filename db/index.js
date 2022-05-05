let mongoose = require('mongoose');

const connectDb = () => {
  return mongoose.connect(
    'mongodb+srv://root:root@cluster0.10g9w.mongodb.net/myBlockChain?retryWrites=true&w=majority',
    {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true
    }
  )
}

module.exports = connectDb