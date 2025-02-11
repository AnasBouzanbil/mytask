import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import './index.css';
import io from "socket.io-client";
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US').format(num);
};

const StatCard = ({ label, value }) => (
  <div className="stat-card">
    <div className="stat-value">{formatNumber(value)}</div>
    <div className="stat-label">{label}</div>
  </div>
);

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [currentStats, setCurrentStats] = useState({
    population: 0,
    births: 0,
    deaths: 0
  });
  const [darkMode, setDarkMode] = useState(false);
  const [currentRegion, setCurrentRegion] = useState("world");

  useEffect(() => {
    const socket = io("http://localhost:4000");

    socket.on("populationData", (newData) => {
      setData(prevData => {
        const updatedData = [...prevData, newData].slice(-20);
        setCurrentStats({
          population: newData.population,
          births: newData.births,
          deaths: newData.deaths
        });
        return updatedData;
      });
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    return () => socket.disconnect();
  }, []);

  const changeRegion = (region) => {
    const socket = io("http://localhost:4000");
    socket.emit("changeRegion", region);
    setCurrentRegion(region);
    setData([]);
  };
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };


  const themeClass = darkMode ? 'dark' : '';

  return (
    <div className={`dashboard ${themeClass}`}>
      <div className="dashboard-header">
        <h1>Population Dashboard</h1>
        <button onClick={toggleTheme} className="theme-toggle">
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Population" value={currentStats.population} />
        <StatCard label="Births (Last Hour)" value={currentStats.births} />
        <StatCard label="Deaths (Last Hour)" value={currentStats.deaths} />
      </div>
      



      <ButtonGroup
  disableElevation
  variant="contained"
  aria-label="Disabled button group"
  className='buttons'
>
  <Button className='button' onClick={() => changeRegion("world")}>World</Button>
  <Button className='button'  onClick={() => changeRegion("morocco")}>Morocco</Button>
  </ButtonGroup>
      <div className='charts'>
              <div className="chart-container">
        <h2>Population Trend</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis tickFormatter={formatNumber} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="population" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h2>Births & Deaths</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="births" fill="#413ea0" />
            <Bar dataKey="deaths" fill="#ff7373" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {currentRegion}
    </div>
      </div>


  );
};

export default Dashboard;