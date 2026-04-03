
const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * Application Handshake: Fetches all core configurations, master data, 
 * users, and roles to initialize the frontend global context state.
 */
router.get('/all', async (req, res) => {
    try {
        const queries = [
            'SELECT * FROM lead_sources',
            'SELECT * FROM lead_statuses',
            'SELECT * FROM application_statuses',
            'SELECT * FROM passport_statuses',
            'SELECT * FROM document_types',
            'SELECT * FROM remark_statuses',
            'SELECT * FROM service_types',
            'SELECT * FROM lost_reasons',
            'SELECT * FROM sale_by',
            'SELECT * FROM worked_by',
            'SELECT id, name, username, email, role_id as roleId, role_name as role, status, image_url as imageUrl FROM users',
            'SELECT * FROM roles',
            'SELECT * FROM vendors',
            'SELECT id, company_name as companyName, address, city, state, country, pincode, from_name as fromName, from_email as fromEmail, reply_name as replyName, reply_email as replyEmail, help_email as helpEmail, info_email as infoEmail, phone, secondary_phone as secondaryPhone, instagram_link as instagramLink, facebook_link as facebookLink, twitter_link as twitterLink, linkedin_link as linkedinLink, website, gst_no as gstNo, timezone, date_format as dateFormat, currency, logo_url as logoUrl, favicon_url as faviconUrl FROM company_details WHERE id = 1'
        ];

        const results = await Promise.all(queries.map(q => db.execute(q)));

        // Senior Implementation: Parse JSON strings for roles fetched in bulk
        const roles = results[11][0].map(role => {
            let perms = {};
            if (role.permissions) {
                if (typeof role.permissions === 'string') {
                    try { perms = JSON.parse(role.permissions); } catch (e) { perms = {}; }
                } else { perms = role.permissions; }
            }
            return { ...role, permissions: perms };
        });

        res.json({
            leadSources: results[0][0],
            leadStatuses: results[1][0],
            applicationStatuses: results[2][0],
            passportStatuses: results[3][0],
            documentTypes: results[4][0],
            remarkStatuses: results[5][0],
            serviceTypes: results[6][0],
            lostReasons: results[7][0],
            saleBy: results[8][0],
            workedBy: results[9][0],
            users: results[10][0],
            roles: roles,
            vendors: results[12][0],
            companyDetails: results[13][0][0] || {}
        });
    } catch (err) { 
        console.error('Handshake fetch failed:', err);
        res.status(500).json({ error: err.message }); 
    }
});

/**
 * Update global company profile
 */
router.put('/company', async (req, res) => {
    const c = req.body;
    const sql = `UPDATE company_details SET company_name=?, address=?, city=?, state=?, country=?, pincode=?, from_name=?, from_email=?, reply_name=?, reply_email=?, help_email=?, info_email=?, phone=?, secondary_phone=?, instagram_link=?, facebook_link=?, twitter_link=?, linkedin_link=?, website=?, gst_no=?, timezone=?, date_format=?, currency=? WHERE id=1`;
    try {
        await db.execute(sql, [c.companyName, c.address, c.city, c.state, c.country, c.pincode, c.fromName, c.fromEmail, c.replyName, c.replyEmail, c.helpEmail, c.infoEmail, c.phone, c.secondaryPhone, c.instagramLink, c.facebookLink, c.twitterLink, c.linkedinLink, c.website, c.gstNo, c.timezone, c.dateFormat, c.currency]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
