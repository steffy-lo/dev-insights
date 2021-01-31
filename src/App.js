import React, {useState } from "react";
import { XAxis, YAxis, CartesianGrid, Tooltip, Bar, BarChart, Cell} from 'recharts';
import './App.css';
import { Paper, Tabs, Tab, FormControl, Select, MenuItem, Grid, Switch} from '@material-ui/core';
import { FiberManualRecord } from '@material-ui/icons';
import { TabPanel } from "@material-ui/lab";
import TabContext from '@material-ui/lab/TabContext';
import CSVReader from 'react-csv-reader';
import _ from 'lodash';
import Chart from "react-apexcharts";

// import SankeyDiagram from "./components/sankey";

function App() {
  const [unit, setUnit] = useState("Percentage");
  const [dailyData, setDailyData] = useState([]);
  const [day, setDay] = useState([{"Day": ""}]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [week, setWeek] = useState([{"Week": ""}]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [month, setMonth] = useState([{"Month": "", "data": []}]);
  const [value, setValue] = React.useState("0");
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FD3A4A', '#AF6E4D', '#BFAFB2', '#FFE933', '#DE3163', '#FF7F50', '#40E0D0', '#6495ED', '#CCCCFF'];

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

  const handleMonthChange = (event) => {
    for (let monthData of monthlyData) {
      if (monthData[0].Month === event.target.value) {
        setMonth(monthData)
      }
    }
  }

  const getStyle = (data) => {
    let style = {
      display: 'flex',
      alignItems: 'center'
    }
    const benchmark = getActivityMeter(data)
    if (benchmark === "usual") return {...style, color: "#27AE60"}
    else if (benchmark === "higher") return {...style, color: "#E74C3C"}
    else if (benchmark === "lower") return {...style, color: "#F1C40F"}
  }

  const getActivityMessage = (data) => {
    const benchmark = getActivityMeter(data)
    if (benchmark === "usual") return "About Usual"
    else if (benchmark === "higher") return "Higher Than Usual"
    else if (benchmark === "lower") return "Lower Than Usual"
  }

  const getActivityMeter = (data) => {
    const benchmark = _.find(_.uniqBy(dailyData.flat(1), "Tag"), {Tag: data.Tag})
    if (benchmark !== undefined) {
      console.log(benchmark.Percentage, data.Percentage)
      if (benchmark.Percentage + 5 >= data.Percentage && benchmark.Percentage - 5 <= data.Percentage) return "usual"
      else if (benchmark.Percentage < data.Percentage) return "higher"
      else return "lower"
    }
  }

  const countMinutes = (str) => {
    const [hh = '0', mm = '0', ss = '0'] = (str || '0:0:0').split(':');
    const hour = parseInt(hh, 10) || 0;
    const minute = parseInt(mm, 10) || 0;
    const second = parseInt(ss, 10) || 0;
    return ((hour*3600) + (minute*60) + (second)) / 60;
  };

  const minToString = (minutes) => {
    const hour = Math.floor(minutes/60);
    const minute = minutes % 60;
    if (hour > 0)
      return hour + "h " + minute + " min"
    else
      return minute + " min"
  };

  if (dailyData.length > 0) {
    return (
        <div className="App">
          <TabContext value={value}>
            <Paper style={{marginBottom: '20px'}}>
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
              <BarChart style={{margin: 'auto', marginBottom: '50px'}}
                        width={1500} height={600} data={day}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="Tag"/>
                <YAxis/>
                <Tooltip/>
                <Bar dataKey={unit}>
                  {COLORS.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>)}
                </Bar>
              </BarChart>
              {day.map(data => {
                return (
                    <Grid container spacing={2} style={{backgroundColor: 'white',
                      maxWidth: '90%',
                      marginBottom: '30px',
                      marginLeft: '5%',
                      wordBreak: 'break-word',
                      alignItems: 'center',
                      padding: '10px',
                      borderRadius: '4px',
                      boxShadow: '1px 1px 10px 0 rgba(0, 0, 0, 0.15)',
                      height: '60px',
                      fontSize: '16px',
                    }}>
                      <Grid item xs={6}>
                        <span>{data.Tag}</span>
                      </Grid>
                      <Grid item xs={3}>
                        <span>{minToString(data.Time)}</span>
                      </Grid>
                      <Grid item xs={3}>
                        <span style={getStyle(data)}><FiberManualRecord color="inherit" style={{ marginRight: '10px'}}/>{getActivityMessage(data)}</span>
                      </Grid>
                    </Grid>
                );
              })}
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
              <BarChart style={{margin: 'auto', marginBottom: '50px'}}
                        width={1500} height={600} data={week}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="Tag"/>
                <YAxis/>
                <Tooltip/>
                <Bar dataKey={unit}>
                  {COLORS.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>)}
                </Bar>
              </BarChart>
              {week.map(data => {
                console.log(data)
                return (
                    <Grid container spacing={2} style={{backgroundColor: 'white',
                      maxWidth: '90%',
                      marginBottom: '30px',
                      marginLeft: '5%',
                      wordBreak: 'break-word',
                      alignItems: 'center',
                      padding: '10px',
                      borderRadius: '4px',
                      boxShadow: '1px 1px 10px 0 rgba(0, 0, 0, 0.15)',
                      height: '60px',
                      fontSize: '16px',
                    }}>
                      <Grid item xs={6}>
                        <span>{data.Tag}</span>
                      </Grid>
                      <Grid item xs={3}>
                        <span>{minToString(data.Time)}</span>
                      </Grid>
                      <Grid item xs={3}>
                        <span style={getStyle(data)}><FiberManualRecord color="inherit" style={{ marginRight: '10px'}}/>{getActivityMessage(data)}</span>
                      </Grid>
                    </Grid>
                );
              })}
            </TabPanel>
            <TabPanel value="2">
              <FormControl variant="outlined" style={{ minWidth: '250px', marginBottom: '25px'}}>
                <Select onChange={handleMonthChange} value={month[0].Month}>
                  {monthlyData.map(month => <MenuItem key={month[0].Month} value={month[0].Month}>{month[0].Month}</MenuItem>)}
                </Select>
              </FormControl>
              <div style={{ marginLeft: '10%', marginRight: '10%'}}>
                <Chart type={"heatmap"} height={800} series={month} options={{chart: {
                  height: 350,
                  type: 'heatmap',
                },
                  dataLabels: {
                  enabled: false
                },
                xaxis: {
                  type: 'category',
                  categories: Array.apply(null, Array(month[0].data.length)).map(function (x, i) { return i+1; })
                },
                colors: COLORS,
                }}/>
              </div>
            </TabPanel>
          </TabContext>
        </div>
    );
  } else {
    return (
        <CSVReader
            parserOptions={{ header: true }}
            onFileLoaded={data => {

              // daily data
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

              // weekly data
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

              // monthly data
              const monthlyList = [];
              let j = 0
              for (let i = 0; i < dailyList.length - 1; i += 30) {
                monthlyList.push([]);
                const thirtyDays = dailyList.slice(i, i+30);
                const monthlyPrograms = _.map(_.uniqBy(thirtyDays.flat(1), "Tag"), "Tag")
                for (let program of thirtyDays) {
                  for (let data of program) {
                    const matchedData = _.find(monthlyList[j], {name: data.Tag})
                    if (matchedData !== undefined) {
                      matchedData.data.push(parseFloat(data.Percentage));
                    } else {
                      monthlyList[j].push({
                        Month: thirtyDays[0][0].Day + " — " + thirtyDays[thirtyDays.length - 1][0].Day,
                        name: data.Tag,
                        data: [parseFloat(data.Percentage)]
                      })
                    }
                  }
                  const unusedPrograms = _.difference(monthlyPrograms, _.map(program, "Tag"))
                  for (let prog of unusedPrograms) {
                    const matchedData = _.find(monthlyList[j], {name: prog})
                    if (matchedData !== undefined) {
                      matchedData.data.push(0);
                    } else {
                      monthlyList[j].push({
                        Month: thirtyDays[0][0].Day + " — " + thirtyDays[thirtyDays.length - 1][0].Day,
                        name: prog,
                        data: [0]
                      })
                    }
                  }
                }
                j += 1;
              }
              setMonthlyData(monthlyList)
              setMonth(monthlyList[monthlyList.length - 1])

            }}
        />
    )
  }
}

export default App;

