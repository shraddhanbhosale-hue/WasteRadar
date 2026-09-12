const mongoose = require("mongoose");
require("dotenv").config();

const Village = require("./src/models/Village");

const villages = [
  {
    name: "Loni",
    district: "Ahilyanagar",
    state: "Maharashtra",
    latitude: 19.5769,
    longitude: 74.4766,
  },
  {
    name: "Rahata",
    district: "Ahilyanagar",
    state: "Maharashtra",
    latitude: 19.3907,
    longitude: 74.6497,
  },
  {
    name: "Shirdi",
    district: "Ahilyanagar",
    state: "Maharashtra",
    latitude: 19.7666,
    longitude: 74.4774,
  },
  {
    name: "Sangamner",
    district: "Ahilyanagar",
    state: "Maharashtra",
    latitude: 19.5678,
    longitude: 74.2118,
  },
  {
    name: "Kopargaon",
    district: "Ahilyanagar",
    state: "Maharashtra",
    latitude: 19.8823,
    longitude: 74.4769,
  },
  {
    name: "Akole",
    district: "Ahilyanagar",
    state: "Maharashtra",
    latitude: 19.5396,
    longitude: 74.0055,
  },
  {
    name: "Nevasa",
    district: "Ahilyanagar",
    state: "Maharashtra",
    latitude: 19.5517,
    longitude: 74.9286,
  },
  {
    name: "Shrigonda",
    district: "Ahilyanagar",
    state: "Maharashtra",
    latitude: 18.6167,
    longitude: 74.6833,
  },
  {
    name: "Karjat",
    district: "Ahilyanagar",
    state: "Maharashtra",
    latitude: 18.5500,
    longitude: 75.0000,
  },
  {
    name: "Pathardi",
    district: "Ahilyanagar",
    state: "Maharashtra",
    latitude: 19.1736,
    longitude: 75.1747,
  },
  {
    name: "Parner",
    district: "Ahilyanagar",
    state: "Maharashtra",
    latitude: 19.0000,
    longitude: 74.4333,
  },
  {
    name: "Shevgaon",
    district: "Ahilyanagar",
    state: "Maharashtra",
    latitude: 19.3500,
    longitude: 75.2167,
  },
  {
    name: "Nashik",
    district: "Nashik",
    state: "Maharashtra",
    latitude: 19.9975,
    longitude: 73.7898,
  },
  {
    name: "Sinnar",
    district: "Nashik",
    state: "Maharashtra",
    latitude: 19.8456,
    longitude: 73.9989,
  },
  {
    name: "Yeola",
    district: "Nashik",
    state: "Maharashtra",
    latitude: 20.0422,
    longitude: 74.4894,
  },
  {
    name: "Niphad",
    district: "Nashik",
    state: "Maharashtra",
    latitude: 20.0833,
    longitude: 73.8000,
  },
  {
    name: "Pune",
    district: "Pune",
    state: "Maharashtra",
    latitude: 18.5204,
    longitude: 73.8567,
  },
  {
    name: "Baramati",
    district: "Pune",
    state: "Maharashtra",
    latitude: 18.1517,
    longitude: 74.5777,
  },
  {
    name: "Daund",
    district: "Pune",
    state: "Maharashtra",
    latitude: 18.4652,
    longitude: 74.5837,
  },
  {
    name: "Shirur",
    district: "Pune",
    state: "Maharashtra",
    latitude: 18.8276,
    longitude: 74.3747,
  },
  {
    name: "Satara",
    district: "Satara",
    state: "Maharashtra",
    latitude: 17.6805,
    longitude: 74.0183,
  },
  {
    name: "Karad",
    district: "Satara",
    state: "Maharashtra",
    latitude: 17.2897,
    longitude: 74.1811,
  },
  {
    name: "Kolhapur",
    district: "Kolhapur",
    state: "Maharashtra",
    latitude: 16.7050,
    longitude: 74.2433,
  },
  {
    name: "Sangli",
    district: "Sangli",
    state: "Maharashtra",
    latitude: 16.8524,
    longitude: 74.5815,
  },
  {
    name: "Miraj",
    district: "Sangli",
    state: "Maharashtra",
    latitude: 16.8270,
    longitude: 74.6440,
  },
];

const seedVillages = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected ✅");

    await Village.deleteMany({});

    await Village.insertMany(villages);

    console.log(
      `${villages.length} villages inserted successfully ✅`
    );

    await mongoose.connection.close();

    console.log("MongoDB connection closed.");

    process.exit(0);
  } catch (error) {
    console.error(
      "Village seeding failed ❌",
      error.message
    );

    await mongoose.connection.close();

    process.exit(1);
  }
};

seedVillages();