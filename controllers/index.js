'use strict';
var PayPalEC = require("paypal-ec");
var Log = require('log'), log = new Log('info');
var request = require("request");
var querystring = require("querystring");

module.exports = function (server) {

    server.get('/', function (req, res) {
      // setup a payment
      request({
        uri: 'https://api-3t.sandbox.paypal.com/nvp',
        method: "POST",
        form: {
          USER:'reference_api1.cgb.im',
          PWD: '1384669463',
          SIGNATURE: "An5ns1Kso7MWUdW4ErQKJJJ4qi4-AyZ-f8If1xhKIgqGCQ.degtgIKn6",
          METHOD: "SetExpressCheckout",
          VERSION: "86",
          PAYMENTREQUEST_0_PAYMENTACTION: "AUTHORIZATION",
          PAYMENTREQUEST_0_AMT: "0",
          PAYMENTREQUEST_0_CURRENCYCODE: "USD",
          L_BILLINGTYPE0: "MerchantInitiatedBilling",
          L_BILLINGAGREEMENTDESCRIPTION0: "My billing agreement",
          cancelUrl: "http://127.0.0.1:8000/cancel",
          returnUrl: "http://127.0.0.1:8000/success"
        }
      }, function(error, response, body) {
        var info = querystring.parse(body);
        res.redirect("https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token="+info["TOKEN"])
      });
    });

    server.get("/success", function (req, res) {
      // create the billing agreement
      var token = req.query.token;
      var billing_agreement_id;

      request({
        uri: 'https://api-3t.sandbox.paypal.com/nvp',
        method: "POST",
        form: {
          USER:'reference_api1.cgb.im',
          PWD: '1384669463',
          SIGNATURE: "An5ns1Kso7MWUdW4ErQKJJJ4qi4-AyZ-f8If1xhKIgqGCQ.degtgIKn6",
          METHOD: "CreateBillingAgreement",
          VERSION: "86",
          TOKEN: token
        }
      }, function(error, response, body) {
        var info = querystring.parse(body);
        billing_agreement_id = info["BILLINGAGREEMENTID"]

        // do a reference transaction
        request({
          uri: 'https://api-3t.sandbox.paypal.com/nvp',
          method: "POST",
          form: {
            USER:'reference_api1.cgb.im',
            PWD: '1384669463',
            SIGNATURE: "An5ns1Kso7MWUdW4ErQKJJJ4qi4-AyZ-f8If1xhKIgqGCQ.degtgIKn6",
            METHOD: "DoReferenceTransaction",
            VERSION: "86",
            AMT: 50,
            CURRENCYCODE: "USD",
            PAYMENTACTION: "SALE",
            REFERENCEID: billing_agreement_id
          }
        }, function(error, response, body) {
          var info = querystring.parse(body);
          res.send("Your payment was a success, transaction # "+info["TRANSACTIONID"]);
        });
      });

    });

};
