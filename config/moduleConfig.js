const moduleConfig = [
  {
    type: "user",
    apiVersion: "v1",
    status: true,
    route: true,
    routeName: "user",
  },
  {
    type: "admin",
    apiVersion: "v1",
    status: false,
    route: true,
    routeName: "admin",
  },
  {
    type: "payment",
    apiVersion: "v1",
    status: true,
    route: true,
    routeName: "payment",
  },
  {
    type: "order",
    apiVersion: "v1",
    status: true,
    route: true,
    routeName: "order",
  },
  {
    type: "message",
    apiVersion: "v1",
    status: true,
    route: true,
    routeName: "message",
  }
];

module.exports = moduleConfig;
