
# KSA COVID-19 DATA

This repository provides the data of COVID-19 in Saudi Arabia in JSON format. 

The data contains total number of infections, recoveries, and deaths day by day as announced by Ministry of Health (MOH) in Saudi Arabia.
It also contains the number of infections for each city on each day.

## Getting The Data

The data is located in the `output` directory.
You can simply embed the files inside your application directly and load them from your code.

If you want your application to have an up-to-date version of the data then:
1. Navigate to the file you want.
2. Click the `Raw` button on the top left.
3. Copy the link from the URL into your application.
4. Use this link to download a recent version at any time using any HTTP client available to you.

Check Data Source section below for the frequency of these updates.

## Data Format

* ###  `output\saudi_moh_data.json`

  This file contains all the announcements by MOH.

  The `file` contains an object with the following properties:
   - `announcements`: array of announcements.
  
  Each `announcement` has the following properties:
   - `date`: The exact date of the announcement.
   - `references`: array of links to the source of this announcement.
   - `recoveries`: array of records.
   - `deaths`: array of records.
   - `infections`: array of records.

  Each `record` has the following properties:
   - `city`: The name of the city (`"Unknown"` means it is unknown in which city).
   - `number`: The number of cases.


* ###  `output\ksa_data.json`

  This file contains more usable data that is produced by processing `output\saudi_moh_data.json` file.
  This file has a single record per day since the first reported case to the last reported.

  The `file` contains an array of records. Each record represent a day and guaranteed to be sequential and in ascending order.

  Each `record` has the following properties:
   - `date`: The date for which this record gives information about.
   - `references`: All references from which this information was extracted.
   - `infections`: Number of new infections reported today.
   - `recoveries`: Number of new recoveries reported today.
   - `deaths`: Number of new deaths reported today.
   - `total_infections`: Total number of infections from start up-to and including today.
   - `total_recoveries`: Total number of recoveries from start up-to and including today.
   - `total_deaths`: Total number of deaths from start up-to and including today.
   - `cities`: is an object where each key is a name of the city and the value is the number of infections in that city on this day.


## Data Source

This data is collected manually from the publications of Ministry of Heath in Saudi Arabia.
MOI publishes a daily report on COVID-19 cases in each city on their Twitter account @SaudiMOH.

MOH publishes a daily report on their Twitter account @SaudiMOH at about ~03:40 PM (+03 timezone). 
It takes me some time to manually extract this data from the report and update the data files then commit and push the changes.

If you know/have a better way to get this data from MOH then let me know (by opening an issue).

## Contribution

If you have suggestions or corrections feel free to open a new issue.
