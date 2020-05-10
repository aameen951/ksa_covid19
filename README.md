
# COVID-19 Data in KSA

This repository provides the data of confirmed cases of COVID-19 in Saudi Arabia in JSON format. 

The data contains the number of infections, recoveries, and deaths in each city day by day as announced by Ministry of Health (MOH) in Saudi Arabia.

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

* ###  `output\ksa_data_v2.json`

  All timestamps in this file are represented by the number of milliseconds since January 1, 1970 00:00:00 UTC.

  The `file` is an object that has the following properties:
    - `last_update`: timestamp of the latest cases update published by MOH.
    - `infections`: total number of infections from start to `last_update`.
    - `recoveries`: total number of recoveries from start to `last_update`.
    - `deaths`: total number of deaths from start to `last_update`.
    - `cities`: is an object where each key is the name of the city in english and the value is a `city` object.

  Each `city` is an object that has the following properties:
    - `name_ar`: the name of the city in Arabic.
    - `name_eng`: the name of the city in English.
    - `code`: the code of the city.
    - `infections`: the total number of infections in this city from start to `last_update`.
    - `recoveries`: the total number of recoveries in this city from start to `last_update`.
    - `deaths`: the total number of deaths in this city from start to `last_update`.
    - `records`: an array of `record`s.

  Each `record` is an array of 4 entries which represent an update from MOH:
    - `[0]`: the timestamp in with this record was published by MOH.
    - `[1]`: the number of infections.
    - `[2]`: the number of recoveries.
    - `[3]`: the number of deaths.

* ###  `output\saudi_moh_data.json`

  **Deprecated: this format will no longer be updated.**

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

  **Deprecated: this format will no longer be updated**

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

  - `output\ksa_data_v2.json`

    This data is collected automatically from http://covid19.moh.gov.sa/ and pushed to GitHub on a daily basis.
  
  - `output\ksa_data.json` and `output\ksa_data.json`.

    This data is collected manually from the publications of Ministry of Heath in Saudi Arabia.
    MOI publishes a daily report on COVID-19 cases in each city on their Twitter account @SaudiMOH.

    MOH publishes a daily report on their Twitter account @SaudiMOH at about ~03:40 PM (+03 timezone). 
    It takes me some time to manually extract this data from the report and update the data files then commit and push the changes.

## Contribution

If you have suggestions or corrections feel free to open a new issue.
