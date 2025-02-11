const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());

const regions = {
  world: {
    population: 8205296090,
    births: 385000, 
    deaths: 165000, 
    birthRate: 18.5, 
    deathRate: 7.5, 
  },
  morocco: {
    population: 37457000,
    births: 1800,    
    deaths: 750,    
    birthRate: 17.5,
    deathRate: 7.3,  
  }
};

let currentRegion = "world";
const calculatePopulationChange = (region) => {
  const data = regions[region];
  const hourlyBirthRate = data.birthRate / (24 * 365.25) * (data.population / 1000);
  const hourlyDeathRate = data.deathRate / (24 * 365.25) * (data.population / 1000);
  
  const randomVariation = (rate) => rate * (0.95 + Math.random() * 0.1);
  
  return {
    births: Math.round(randomVariation(hourlyBirthRate)),
    deaths: Math.round(randomVariation(hourlyDeathRate))
  };
};

io.on("connection", (socket) => {
  console.log("A user connected");

  const interval = setInterval(() => {
    const regionData = regions[currentRegion];
    const changes = calculatePopulationChange(currentRegion);

    regionData.births = changes.births;
    regionData.deaths = changes.deaths;
    regionData.population = Math.max(0, regionData.population + changes.births - changes.deaths);

    socket.emit("populationData", {
      time: new Date().toLocaleTimeString(),
      region: currentRegion,
      ...regionData,
    });
  }, 2000);

  socket.on("changeRegion", (region) => {
    if (regions[region]) {
      currentRegion = region;
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
    clearInterval(interval);
  });
});

server.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});