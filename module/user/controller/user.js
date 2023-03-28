const User = require('../../user/model/userTable');
const utilityFunc = require('../../../utility/functions');

module.exports = {

    register: async (req, res) => {
        try {
            let data = req.body;
            utilityFunc.sendErrorResponse({}, data);
        } catch (error) {
            utilityFunc.sendErrorResponse(error, res);
        }
    }

}