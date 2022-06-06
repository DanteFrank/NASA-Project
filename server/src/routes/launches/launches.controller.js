const {
  getAllLaunches,
  addNewLaunch,
  existsWithLaunchId,
  abortLaunchWithId,
} = require("../../models/launches.model.js");

function httpGetAllLaunches(req, res) {
  return res.status(200).json(getAllLaunches());
}

function httpAddNewLaunch(req, res) {
  const launch = req.body;

  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.target ||
    !launch.launchDate
  ) {
    return res.status(400).json({
      error: "Missing parameters. Please recheck!",
    });
  }

  launch.launchDate = new Date(launch.launchDate);

  if (isNaN(launch.launchDate)) {
    return res.status(400).json({
      error: "Invalid Date Format",
    });
  }

  addNewLaunch(launch);
  res.status(201).json(launch);
}

function httpAbortLaunch(req, res) {
  const launchId = Number(req.params.id);

  //if launchId does not exist
  if (!existsWithLaunchId(launchId)) {
    return res.status(404).json({ error: "lauch does not exist" });
  }

  const aborted = abortLaunchWithId(launchId);
  //if launchId exists
  return res.status(200).json(aborted);
}

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
};
