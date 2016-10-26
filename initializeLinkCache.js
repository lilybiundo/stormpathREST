var stormpath = require('stormpath');

var spclient = new stormpath.Client();

/* fetching hrefs in functions is a pain in the ass, but pulling accounts and
groups etc. requires having their href, so easier to cache them here 

Also conceivable to populate a config file manually to avoid having a global variable, but
that potentially requires more maintenance */

module.exports = function () {
    global.hrefcache = {
        accounts: {},
        groups: {},
        application: 'https://api.stormpath.com/v1/applications/2CyAp5P9Oh0cn6JWe2SWjU'
    };
    
    spclient.getAccounts(function (err, accountsCollection) {
        if (err) {
            console.log(err.message);
        } else {
            accountsCollection.each(function (account, next) {
                global.hrefcache.accounts[account.username] = account.href;
                next();
            });
        }
    });

    spclient.getGroups(function (err, groupsCollection) {
        if (err) {
            console.log(err.message);
        } else {
            groupsCollection.each(function (group, next) {
                global.hrefcache.groups[group.name] = group.href;
                next();
            });
        }
    });
};
