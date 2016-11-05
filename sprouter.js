var express = require('express'),
    stormpath = require('stormpath');
//var expstormpath = require('express-stormpath');

var router = express.Router();

var apiKey = new stormpath.ApiKey(
    'P7ZYWSSPMCCVHDE8YJ33H1KPX',
    'uNOuZ44nYYcAzQPmHstMR2T6Bv+bX963l4Fpg5Ql+DI'
);

var spclient = new stormpath.Client({
    apiKey: apiKey
});

//gets a json object containing all account objects
//no params
router.get('/accounts', function (req, res) {
    console.log('getting accounts');
    spclient.getAccounts(function (err, accountsCollection) {
        if (err) {
            res.end(err.message);
        } else {
            res.json(accountsCollection.items);
            res.end();
        }
    });
});


//gets a json object containing all group objects
//no params
router.get('/groups', function (req, res) {
    spclient.getGroups(function (err, groupsCollection) {
        if (err) {
            res.end(err.message);
        } else {
            res.json(groupsCollection.items);
            res.end();
        }
    });
});

//Create a new account (can be updated to update existing account)
//Required query params: accountEmail
//Optional query Params: fname, lname
router.post('/account', function(req, res) {
    //validate account info
    if (req.query.accountEmail === undefined) {
        //TODO: Validate email address
        res.status(400);
        res.end('Error, invalid request');
    }
    
    var newAccount = {
        givenName: req.query.fname,
        surname: req.query.lname,
        username: req.query.accountEmail,
        email: req.query.accountEmail,
        password: 'Changeme1!'
    };
    
    spclient.getApplication(global.hrefcache.application, function(err, application) {
        if (err) {
            res.end(err.message);
        } else {
            application.createAccount(newAccount, function(err, createdAccount) {
                if (err) {
                    res.end(err.message);
                } else {
                    global.hrefcache.accounts[createdAccount.email] = createdAccount.href;
                    res.end('Account Created!');
                }
            });
        }
    });
});

//Creates a new group specified with groupName
//should be admin only in production
//query params: groupName, description (optional)
router.post('/group', /*expstormpath.groupsRequired(['admin']),*/ function (req, res) {
    if (req.query.groupName === undefined) {
        res.status(400);
        res.end('Error, invalid request');
    }

    spclient.getApplication(global.hrefcache.application, function (err, application) {
        if (err) {
            res.end(err.message);
        } else {
            var newGroup = {
                name: req.query.groupName
            };
            application.createGroup(newGroup, function (err, group) {
                if (err) {
                    res.end(err.message);
                } else {
                    global.hrefcache.groups[group.name] = group.href;
                    res.send('Group Created!');
                }
            });
        }
    });
});

//Adds an account specified by username to a group specified by name
//should be admin only in production
//query params: groupName, accountName
//if account or group does not exist, will error out (checks group first if both are invalid)
//Stormpath will proc its own error if the account is already a member of the group
router.post('/addAccountToGroup', /*expstormpath.groupsRequired(['admin']),*/ function (req, res) {
    console.log('routing /addAccountToGroup');
    var grouphref;
    var accounthref;

    // validate account/group names
    if (req.query.groupName === undefined || req.query.accountName === undefined) {
        res.status(400);
        res.end('Error, invalid request');
    } else {
        if (req.query.groupName in global.hrefcache.groups) {
            grouphref = global.hrefcache.groups[req.query.groupName];
        } else {
            res.status(404);
            return res.send('Group not found');
        }

        if (req.query.accountName in global.hrefcache.accounts) {
            accounthref = global.hrefcache.accounts[req.query.accountName];
        } else {
            res.status(404);
            return res.send('Account not found');
        }
    }

    //grab the group with its href, then the account, then insert account into group
    spclient.getGroup(grouphref, function (err, group) {
        if (err) {
            res.end(err.message);
        } else {
            spclient.getAccount(accounthref, function (err, account) {
                if (err) {
                    res.end(err.message);
                } else {
                    group.addAccount(account, function (err, GroupMembership) {
                        if (err) {
                            res.end(err.message);
                        } else {
                            res.end('Success! Added user to group');
                        }
                    });
                }
            });
        }

    });
});


module.exports = router;
