import React, {useState } from "react";
import { XAxis, YAxis, CartesianGrid, Tooltip, Bar, BarChart, Cell} from 'recharts';
import './App.css';
import { Paper, Tabs, Tab, FormControl, Select, MenuItem, Grid, Switch} from '@material-ui/core';
import { TabPanel } from "@material-ui/lab";
import TabContext from '@material-ui/lab/TabContext';
import CSVReader from 'react-csv-reader';
import _ from 'lodash';

// import SankeyDiagram from "./components/sankey";

function App() {
  const [unit, setUnit] = useState("Percentage");
  const [dailyData, setDailyData] = useState([]);
  const [day, setDay] = useState([{"Day": ""}]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [week, setWeek] = useState([{"Week": ""}]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [month, setMonthly] = useState([]);
  const [value, setValue] = React.useState("0");
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FD3A4A', '#AF6E4D', '#BFAFB2', '#40E0D0', '#6495ED', '#CCCCFF', '#FFBF00', '#DE3163', '#FF7F50'];

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleUnitChange = (event) => {
    if (event.target.checked)
      setUnit("Time");
    else
      setUnit("Percentage")
  }

  const handleDayChange = (event) => {
    for (let dayData of dailyData) {
      if (dayData[0].Day === event.target.value) {
        setDay(dayData)
      }
    }
  }

  const handleWeekChange = (event) => {
    for (let weekData of weeklyData) {
      if (weekData[0].Week === event.target.value) {
        setWeek(weekData)
      }
    }
  }

  const countMinutes = (str) => {
    const [hh = '0', mm = '0', ss = '0'] = (str || '0:0:0').split(':');
    const hour = parseInt(hh, 10) || 0;
    const minute = parseInt(mm, 10) || 0;
    const second = parseInt(ss, 10) || 0;
    return ((hour*3600) + (minute*60) + (second)) / 60;
  };

  if (dailyData.length > 0) {
    return (
        <div className="App">
          <TabContext value={value}>
            <Paper style={{marginBottom: '5%'}}>
              <Tabs
                  value={value}
                  indicatorColor="primary"
                  textColor="primary"
                  onChange={handleChange}
                  centered
              >
                <Tab label="Daily" value="0"/>
                <Tab label="Weekly" value="1"/>
                <Tab label="Monthly" value="2"/>
              </Tabs>
            </Paper>
            <TabPanel value="0">
              <Grid container spacing={3} style={{ display: 'flex', justifyContent: 'space-between'}}>
                <Grid item xs={6}>
                  <FormControl variant="outlined" style={{ minWidth: '150px', marginBottom: '25px'}}>
                    <Select onChange={handleDayChange} value={day[0].Day}>
                      {dailyData.map(day => <MenuItem key={day[0].Day} value={day[0].Day}>{day[0].Day}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <Switch
                      checked={unit === "Time"}
                      onChange={handleUnitChange}
                      color="primary"
                  />
                  {unit === "Time" ? "Minutes" : "Percentage"}
                </Grid>
              </Grid>
              <BarChart style={{margin: 'auto'}}
                        width={1500} height={600} data={day}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="Tag"/>
                <YAxis/>
                <Tooltip/>
                <Bar dataKey={unit}>
                  {COLORS.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>)}
                </Bar>
              </BarChart>
            </TabPanel>
            <TabPanel value="1">
              <Grid container spacing={3} style={{ display: 'flex', justifyContent: 'space-between'}}>
                <Grid item xs={6}>
                  <FormControl variant="outlined" style={{ minWidth: '150px', marginBottom: '25px'}}>
                    <Select onChange={handleWeekChange} value={week[0].Week}>
                      {weeklyData.map(week => <MenuItem key={week[0].Week} value={week[0].Week}>{week[0].Week}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <Switch
                      checked={unit === "Time"}
                      onChange={handleUnitChange}
                      color="primary"
                  />
                  {unit === "Time" ? "Minutes" : "Percentage"}
                </Grid>
              </Grid>
              <BarChart style={{margin: 'auto'}}
                        width={1500} height={600} data={week}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="Tag"/>
                <YAxis/>
                <Tooltip/>
                <Bar dataKey={unit}>
                  {COLORS.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>)}
                </Bar>
              </BarChart>
            </TabPanel>
            <TabPanel value="2">

            </TabPanel>
          </TabContext>
        </div>
    );
  } else {
    return (
        <CSVReader
            parserOptions={{ header: true }}
            onFileLoaded={data => {
              const daily = _.groupBy(data, 'Day');
              const dailyList = Object.values(daily);
              for (let program of dailyList) {
                for (let data of program) {
                  data.Time = countMinutes(data.Time);
                  data.Percentage = parseFloat(data.Percentage);
                }
              }
              dailyList.pop() // remove last element with empty data
              setDailyData(dailyList);
              setDay(dailyList[dailyList.length - 1])
              const weeklyList = [];
              for (let i = 0; i < dailyList.length - 1; i += 7) {
                const sevenDays = dailyList.slice(i, i+7)
                let weekData = [];
                let weekTitle = sevenDays[0][0].Day + " — " + sevenDays[sevenDays.length - 1][0].Day;
                for (let day of sevenDays) {
                  for (let program of day) {
                    const matchedData = _.find(weekData, {Tag: program.Tag})
                    if (matchedData !== undefined) {
                      matchedData.Time += program.Time
                    } else {
                      weekData.push({
                        Week: weekTitle,
                        Tag: program.Tag,
                        Time: program.Time
                      })
                    }
                  }
                }
                const totalTimeWeekly = _.sumBy(weekData, 'Time');
                for (let program of weekData) {
                  program.Percentage = parseFloat((program.Time / totalTimeWeekly * 100).toFixed(2))
                }
                weeklyList.push(weekData);
              }
              setWeeklyData(weeklyList);
              setWeek(weeklyList[weeklyList.length - 1]);
            }}
        />
    )
  }
}

export default App;

