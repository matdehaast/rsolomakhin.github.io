/* global done:false */
/* global error:false */
/* global PaymentRequest:false */

/**
 * Updates the price based on the selected shipping option.
 * @param {object} details - The current details to update.
 * @param {string} shippingOption - The shipping option selected by user.
 * @return {object} The updated details.
 */
function updateDetails(details, shippingOption) {
  var selectedShippingOption;
  var otherShippingOption;
  if (shippingOption === 'standard') {
    selectedShippingOption = details.shippingOptions[0];
    otherShippingOption = details.shippingOptions[1];
    details.total.amount.value = '55.00';
  } else {
    selectedShippingOption = details.shippingOptions[1];
    otherShippingOption = details.shippingOptions[0];
    details.total.amount.value = '67.00';
  }
  if (details.displayItems.length === 2) {
    details.displayItems.splice(1, 0, selectedShippingOption);
  } else {
    details.displayItems.splice(1, 1, selectedShippingOption);
  }
  selectedShippingOption.selected = true;
  otherShippingOption.selected = false;
  return details;
}

/**
 * Launches payment request that provides multiple shipping options worldwide,
 * regardless of the shipping address.
 */
function onBuyClicked() { // eslint-disable-line no-unused-vars
  var supportedInstruments = [{
      supportedMethods: 'https://google.com/pay',
      data: {
        allowedPaymentMethods: ['TOKENIZED_CARD', 'CARD'],
        apiVersion: 1,
        cardRequirements: {
          'allowedCardNetworks': ['VISA', 'MASTERCARD', 'AMEX'],
        },
        merchantName: 'Rouslan Solomakhin',
        merchantId: '00184145120947117657',
        paymentMethodTokenizationParameters: {
          tokenizationType: 'GATEWAY_TOKEN',
          parameters: {
            'gateway': 'stripe',
            'stripe:publishableKey': 'pk_live_lNk21zqKM2BENZENh3rzCUgo',
            'stripe:version': '2016-07-06',
          },
        },
      },
    },
    {
      supportedMethods: 'basic-card',
    },
  ];

  var details = {
    total: {
      label: 'Donation',
      amount: {
        currency: 'USD',
        value: '55.00'
      }
    },
    displayItems: [{
        label: 'Original donation amount',
        amount: {
          currency: 'USD',
          value: '65.00'
        }
      },
      {
        label: 'Friends and family discount',
        amount: {
          currency: 'USD',
          value: '-10.00'
        }
      }
    ],
    shippingOptions: [{
        id: 'standard',
        label: 'Standard shipping',
        amount: {
          currency: 'USD',
          value: '0.00'
        },
        selected: true
      },
      {
        id: 'express',
        label: 'Express shipping',
        amount: {
          currency: 'USD',
          value: '12.00'
        }
      }
    ]
  };

  var options = {
    requestShipping: true
  };

  if (!window.PaymentRequest) {
    error('PaymentRequest API is not supported.');
    return;
  }

  try {
    var request = new PaymentRequest(supportedInstruments, details, options);

    request.addEventListener('shippingaddresschange', function(e) {
      e.updateWith(new Promise(function(resolve) {
          // No changes in price or shipping options based on shipping address
          // change. (Not specifying any shipping options or errors should
          // preserve the currently selected shipping option in the payment
          // sheet, according to the spec.)
          var noShippingOptions = Object.assign({}, details);
          delete noShippingOptions.shippingOptions;
          resolve(noShippingOptions);
      }));
    });

    request.addEventListener('shippingoptionchange', function(e) {
      e.updateWith(new Promise(function(resolve) {
        resolve(updateDetails(details, request.shippingOption));
      }));
    });

    request.show()
      .then(function(instrumentResponse) {
          instrumentResponse.complete('success')
            .then(function() {
              done('This is a demo website. No payment will be processed.', instrumentResponse);
            })
            .catch(function(err) {
              error(err);
            });
      })
      .catch(function(err) {
        error(err);
      });
  } catch (e) {
    error('Developer mistake: \'' + e.message + '\'');
  }
}
