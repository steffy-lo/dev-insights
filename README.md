https://dev-insights.vercel.app/

# About Dev Insights
Dev Insights is a time tracker viewer that allows you to view your desktop time usage in a typical day, week, and/or month.
Before using Dev Insights, please install arbtt [here](https://arbtt.nomeata.de/#install) and start collecting some data first.
Once your data is ready, upload your data and Dev Insights will uncover some insightful data of how you spend your time!

# Getting Started with Dev Insights
1. Install arbtt to get your personal logs of your desktop time usage
2. Wait for the data to be collected. The more the better.
3. Once you feel your data is ready, export it to CSV using the following command:
```
arbtt-stats --output-format CSV --for-each day > arbttlog.csv
```
4. Upload your arbtt.csv file and view your results!

# Using Categorize File For More Readable Results
You might notice that the programs are not written in a very human-friendly format by default.
To change this, we can use what is called a categorize file to map the values into a more human-friendly result.
To create a categorize file, simply create a new file ending with .cfg and paste the following as a template to map your values:
```
--Convert program executable names to recognizable names
aliases (
  "non_human_friendly_string_1"     -> "Human Friendly String 1",
  "non_human_friendly_string_2"     -> "Human Friendly String 2",
  ...
)
```
To export with your categorize file settings, simply run the same command as before but now with the --categorizefile argument:
```
arbtt-stats --categorizefile [your categorize file] --output-format CSV --for-each day > arbttlog.csv
```
