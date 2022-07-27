const {
  getAllLaunches,
  scheduleNewLaunch,
  existsWithLaunchId,
  abortLaunchWithId,
} = require("../../models/launches.model.js");

const { getPagination } = require("../../services/query");

async function httpGetAllLaunches(req, res) {
  const { skip, limit } = getPagination(req.query);
  const launches = await getAllLaunches(skip, limit);
  return res.status(200).json(launches);
}

async function httpAddNewLaunch(req, res) {
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

  await scheduleNewLaunch(launch);
  console.log(launch);
  res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
  const launchId = Number(req.params.id);

  //if launchId does not exist
  const existsLaunch = await existsWithLaunchId(launchId);
  if (!existsLaunch) {
    return res.status(404).json({ error: "lauch does not exist" });
  }

  const aborted = await abortLaunchWithId(launchId);
  if (!aborted) {
    return res.status(400).json({ error: "failed to abort launch" });
  }
  return res.status(200).json({ ok: true });
}

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
};


