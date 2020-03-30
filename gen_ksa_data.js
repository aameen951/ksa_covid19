function canonical_date(d){
  const year = `${d.getFullYear()}`;
  const month = `${d.getMonth()+1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  const date = `${year}-${month}-${day}`;
  return date;
}
function gen_ksa_data(saudi_moh_data){
  const map = new Map();
  if(saudi_moh_data.announcements.length > 0)
  {
    const start = new Date(saudi_moh_data.announcements[0].date.getTime());
    start.setHours(0, 0, 0, 0);
    const end = new Date(saudi_moh_data.announcements[saudi_moh_data.announcements.length-1].date.getTime());
    end.setHours(24, 0, 0, 0);

    for(let i = start; i<end; i.setUTCDate(i.getUTCDate()+1))
    {
      map.set(canonical_date(i), {
        date: canonical_date(i),
        references: [],
        cities: new Map(),
        infections: 0,
        recoveries: 0,
        deaths: 0,
        total_recoveries: 0,
        total_infections: 0,
        total_deaths: 0,
      });
    }

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

module.exports = {
  gen_ksa_data,
};