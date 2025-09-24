const express = require("express");
const { createGroup, addMember, groupSummary, listGroups, getGroupDetails } = require('../controllers/groupController');

const router = express.Router();

router.post("/addgroup", createGroup);
router.post("/addmember",addMember);

// GET /group/:idOrName/summary -> compute who owes whom
router.get('/:idOrName/summary', groupSummary);

// List groups (optionally filter by member)
router.get('/', listGroups);

// Get group details by id or name
router.get('/:idOrName', getGroupDetails);

module.exports = router;