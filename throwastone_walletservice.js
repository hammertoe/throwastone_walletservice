const RippleAPI = require('ripple-lib').RippleAPI;
const express = require('express')

var app = express()

var api = new RippleAPI({ server: "ws://ripple1:5005" });

api.connect().then(() => {
    console.log('Connected to Ripple');
})

api.on('disconnected', (code) => {
  if (code !== 1000) {
      console.log('Connection is closed due to error.');
      api.connect().then(() => {
	  console.log('Connected to Ripple');
      })
  } else {
      console.log('Connection is closed normally.');
  }
});

app.get('/accounts/:address', function (req, res) {
    address = req.params.address

    try {
	promise = api.getAccountInfo(address)
    } catch (error) {
	if(error instanceof api.errors.ValidationError) {
            return res.status(400).json({ error: 'Invalid address', value: address });
        }
    }

    promise.then(info => {
	api.getSettings(address).then(settings => {
	    var data = Object.assign({}, info, settings)
	    return res.status(200).json(data)
	})
    }).catch(error => {
	//	RippledError: actNotFound
	throw error
	return res.status(404).json({ error: 'Account not found' , value: address});
    })

})
 
app.listen(8001)

