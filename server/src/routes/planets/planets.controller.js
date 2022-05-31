const { getAllPlanets } = require("../../models/planets.model.js");

function httpgetAllPlanets(req, res) {
  return res.status(200).json(getAllPlanets());
}

module.exports = {
  httpgetAllPlanets,
};
