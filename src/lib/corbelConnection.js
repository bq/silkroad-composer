'use strict';

var corbel = require('corbel-js'),
    config = require('../config/config.json'),
    _ = require('underscore');

var PHRASES_COLLECTION = 'composr:Phrase';

var corbelConfig = config['corbel.driver.options'];
corbelConfig = _.extend(corbelConfig, config['corbel.composer.credentials']);

var corbelDriver = corbel.getDriver(corbelConfig);

var onConnectPromise = corbelDriver.iam.token().create().then(function(response) {
    console.log('corbel:connection:success');
	return corbelDriver;
}).catch(function(error) {
    console.error('error:ccomposer:corbel:token', error);
    throw new Error('error:ccomposer:corbel:token');
});

var extractDomain = function(accessToken) {
    var atob = require('atob');
    var decoded = accessToken.replace('Bearer ', '').split('.');
    return JSON.parse(atob(decoded[0])).domainId;
};

var getTokenDriver = function(accessToken) {

    if (!accessToken) {
        throw new Error('error:connection:undefiend:accessToken');
    }

    var iamToken = {
        'accessToken': accessToken.replace('Bearer ', '')
    };

    var corbelConfig = config['corbel.driver.options'];
    corbelConfig.iamToken = iamToken;

    return corbel.getDriver(corbelConfig);
};

module.exports.driver = onConnectPromise;
module.exports.PHRASES_COLLECTION = PHRASES_COLLECTION;
module.exports.extractDomain = extractDomain;
module.exports.getTokenDriver = getTokenDriver;
