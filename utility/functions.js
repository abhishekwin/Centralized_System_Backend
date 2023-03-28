
let sendErrorResponse = function (err, res) {
    return res.status(err.status_code || 200).send({ "status": "failure", "status_code": err.status_code || 200, message: err.message, error_description: err.error_description || '', data: err.data || {} });
};

let sendSuccessResponse = function (result, res, other) {
    let totalcount = result.count ? result.count : '';
    let sendData = {
        "status": "success", "status_code": result.status_code || 200, message: result.message || 'SUCCESS!',
        data: result.data || {}, ...(totalcount)
    };
    sendData = { ...sendData, ...other };
    return res.status(result.status_code || 200).send(sendData);
};
let sendSuccessResponseWithCount = function (result, count, res, other) {
    let sendData = {
        ...result, "status": "success", "status_code": result.status_code || 200,
        message: result.message || 'SUCCESS!', data: result.data || {}, totalCount: count
    };
    sendData = { ...sendData, ...other };
    return res.status(result.status_code || 200).send(sendData);
};

module.exports = {
    sendErrorResponse,
    sendSuccessResponseWithCount,
    sendSuccessResponse
}
