var express = require('express'),
    massive = require('massive');

var router = express.Router();

var connectionString = 'postgres://postgres:XXXXX@localhost/unevrse_test';

var db = massive.connectSync({
    connectionString: connectionString
});


/*
Adds an organization with an accompanying sub-org.
Params (not validated):
orgName - Name of organization
orgStreet - Street address
orgCity
orgState
orgZip
orgWeb
Optional: subOrgName - if not specified will be equal to orgName
*/
router.post('/org', function (req, res) {
    if (req.query.orgName === undefined ||
        req.query.orgStreet === undefined ||
        req.query.orgCity === undefined ||
        req.query.orgState === undefined ||
        req.query.orgZip === undefined ||
        req.query.orgWeb === undefined) {
        res.status(400);
        return res.end('Error, invalid request');
    }
    var subOrg = req.query.subOrgName;
    if (subOrg === undefined) {subOrg = req.query.orgName; }
    db.unevrse.orgs.insert({
        org_name: req.query.orgName,
        org_street_address: req.query.orgStreet,
        org_city: req.query.orgCity,
        org_state: req.query.orgState,
        org_zip: req.query.orgZip,
        org_website: req.query.orgWeb
    }, function(err, result) {
        if (err) {
            res.end(err.message);
        } else {
            //console.log(result.id);
            db.unevrse.sub_orgs.insert({
                org_id: result.id,
                sub_org_name: subOrg
            }, function(err, secondResult) {
                if (err) {
                    res.end(err.message);
                } else {
                    res.end('Successfully Created Org');
                }
            });
        }
    });
});

module.exports = router;
