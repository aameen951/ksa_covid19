function canonical_date(d){
  const year = `${d.getFullYear()}`;
  const month = `${d.getMonth()+1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  const date = `${year}-${month}-${day}`;
  return date;
}
function date_range(start, end){
  start = new Date(start.getTime());
  end = new Date(end.getTime());

  start.setHours(0, 0, 0, 0);
  end.setHours(24, 0, 0, 0);

  const result = [];
  for(let i = start; i<end; i.setUTCDate(i.getUTCDate()+1))
  {
    result.push(canonical_date(i));
  }
  return result;
}


function gen_ksa_data(saudi_moh_data){
  const map = new Map();
  if(saudi_moh_data.announcements.length > 0)
  {
    const start = saudi_moh_data.announcements[0].date;
    const end = saudi_moh_data.announcements[saudi_moh_data.announcements.length-1].date;

    date_range(start, end).forEach(date => {
      map.set(date, {
        date: date,
        references: [],
        cities: new Map(),
        infections: 0,
        recoveries: 0,
        deaths: 0,
        total_recoveries: 0,
        total_infections: 0,
        total_deaths: 0,
      });
    });

    saudi_moh_data.announcements.forEach(announcement => {
      const date = canonical_date(announcement.date);
      const day = map.get(date);

      day.references.push(...announcement.references);

      announcement.infections.forEach(record => {
        day.infections += record.number;
        const day_infections = (day.cities.get(record.city) || 0) + record.number;
        day.cities.set(record.city, day_infections);
      });
      announcement.recoveries.forEach(record => {
        day.recoveries += record.number;
      });
      announcement.deaths.forEach(record => {
        day.deaths += record.number;
      });
    });
  }
  let acc_recoveries = 0;
  let acc_infections = 0;
  let acc_deaths = 0;
  for(let day of map.values()){

    acc_recoveries += day.recoveries;
    acc_infections += day.infections;
    acc_deaths += day.deaths;

    day.total_recoveries = acc_recoveries;
    day.total_infections = acc_infections;
    day.total_deaths = acc_deaths;

    day.cities = Object.fromEntries(day.cities.entries());
  }
  const result = Array.from(map.values());
  return result;
}

function gen_ksa_data_v2(arcgis_data){
  const cities = new Map();
  let infections = 0;
  let recoveries = 0;
  let deaths = 0;
  let last_update = null;

  arcgis_data.forEach(record => {
    const city = cities.get(record.Name_Eng) || {
      name_ar: record.Name,
      name_eng: record.Name_Eng,
      code: record.Place_Code,
      infections:0,
      recoveries:0,
      deaths:0,
      records: [],
    };

    if(!last_update || last_update < record.Reportdt)
    {
      last_update = record.Reportdt;
    }

    city.records.push([
      record.Reportdt.getTime(),
      record.Confirmed,
      record.Recovered,
      record.Deaths,
    ]);

    cities.set(record.Name_Eng, city);
  });

  cities.forEach(city => {
    city.records.forEach(record => {
      city.infections += record[1];
      city.recoveries += record[2];
      city.deaths += record[3];
    });
    infections += city.infections;
    recoveries += city.recoveries;
    deaths += city.deaths;
  });

  const result = {
    data_source: "https://covid19.moh.gov.sa/",
    last_update: last_update.getTime(),
    infections,
    recoveries,
    deaths,
    infections,
    cities: Object.fromEntries(cities.entries()),
  };
  return result;
}

module.exports = {
  gen_ksa_data,
  gen_ksa_data_v2,
};