const { getAllLaunches } = require("../../models/launches.model.js");

function httpgetAllLaunches(req, res) {
  return res.status(200).json(getAllLaunches());
}

module.exports = {
  httpgetAllLaunches,
};
