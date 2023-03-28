const moduleConfig = [
    {
        "type": "user",
        "apiVersion": "v1",
        "status": true,
        "route": true,
        "routeName": "user"
    },
    {
        "type": "admin",
        "apiVersion": "v1",
        "status": false,
        "route": true,
        "routeName": "admin"
    }
]

module.exports = moduleConfig;