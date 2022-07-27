const axios = require("axios");

const launchesSchema = require("./launchesSchema.js");
const planetSchema = require("./planetSchema");

const DEFAULT_FLIGHT_NUMBER = 100;

// const launch = {
//   flightNumber: 100, // flight_number - spacex api
//   mission: "Kepler Exploration X", // name - spacex api
//   rocket: "Explorer IS1", // rocket.name - sapcex api
//   launchDate: new Date("Decemeber 27, 2030"), // date_local - spacex api
//   target: "Kepler-442 b", // Not applicable
//   customers: ["ZTM", "NASA"], // payload.customers - spacex api
//   upcoming: true, // Upcoming - spacex api
//   success: true, // success - spacex api
// };

// saveLaunch(launch);

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

// Map and Populate the launches document
async function populateLaunches() {
  console.log("Downloading Launches Data.....");
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  if (response.status !== 200) {
    console.log("Error downloading launches data");
    throw new Error("Downloading launches failed");
  }

  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];
    const customers = payloads.flatMap((payload) => {
      return payload["customers"];
    });

    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      launchDate: launchDoc["date_local"],
      upcoming: launchDoc["upcoming"],
      success: launchDoc["success"],
      customers,
    };

    console.log(`${launch.flightNumber} ${launch.mission}`);
    await saveLaunch(launch);
  }

  //TODO: Populate Launches Collection Doc....
}
async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });

  if (firstLaunch) {
    console.log("The first launch already exists....");
  } else {
    await populateLaunches();
  }
}

async function findLaunch(filter) {
  return await launchesSchema.findOne(filter);
}

async function existsWithLaunchId(launchId) {
  return await findLaunch({ flightNumber: launchId });
}

async function getLatestFlightNumber() {
  const latestLaunch = await launchesSchema.findOne().sort("-flightNumber");

  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }

  return latestLaunch.flightNumber;
}

async function getAllLaunches(skip, limit) {
  return await launchesSchema
    .find({}, { _id: 0, __v: 0 })
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}

async function saveLaunch(launch) {
  await launchesSchema.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}

async function scheduleNewLaunch(launch) {
  //Check if target planet exists
  const planet = await planetSchema.findOne({
    keplerName: launch.target,
  });

  if (!planet) {
    throw new Error("The target planet does not exist!");
  }

  const newFlightNumber = (await getLatestFlightNumber()) + 1;

  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ["ZTM", "NASA"],
    flightNumber: newFlightNumber,
  });

  await saveLaunch(newLaunch);
}

async function abortLaunchWithId(launchId) {
  return await launchesSchema.updateOne(
    {
      flightNumber: launchId,
    },
    {
      upcoming: false,
      success: false,
    }
  );
  // const aborted = launches.get(launchId);
  // aborted.upcoming = false;
  // aborted.success = false;
  // return aborted;
}

module.exports = {
  loadLaunchData,
  existsWithLaunchId,
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunchWithId,
};
