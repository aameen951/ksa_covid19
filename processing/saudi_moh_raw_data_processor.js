/* cSpell:disable */
const known_cities = {
  "Abha": {},
  "Alahsa": {},
  "Aseer": {},
  "Arar": {},
  "Al Baha": {},
  "Ar Ras": {},
  "Al Badaea": {},
  "Bishah": {},
  "Buraidah": {},
  "Dhahran": {},
  "Dammam": {},
  "Dawadmi": {},
  "Hufof": {},
  "Hafr Albatin": {},
  "Jeddah": {},
  "Jazan": {},
  "Jubail": {},
  "Khobar": {},
  "Khamis Mushait": {},
  "Khafji": {},
  "Khafji": {},
  "Makkah": {},
  "Medina": {},
  "Muhayil Aseer": {},
  "Nairyah": {},
  "Najran": {},
  "Qatif": {},
  "Qassim": {},
  "Qunfuthah": {},
  "Riyadh": {},
  "Ras Tanura": {},
  "Saihat": {},
  "Sharqyah": {},
  "Samtah": {},
  "Taif": {},
  "Tabuk": {},
  "Yanbu": {},
};
/* cSpell:enable */

function validate_and_enhance_raw_data(data){
  data.announcements.forEach((announcement, idx) => {
    if(!announcement.date.match(/^\d{4}-\d\d-\d\d \d\d:\d\d((\+|-)\d\d:\d\d|Z)/)){
      throw new Error(`Entry ${idx+1} has invalid date '${announcement.date}'`);
    }
    announcement.date = new Date(announcement.date);

    if(!Array.isArray(announcement.references)){
      throw new Error(`'references' in entry ${idx+1} is not an array`);
    }
    if(announcement.references.length === 0){
      throw new Error(`'references' in entry ${idx+1} is empty`);
    }

    if(!Array.isArray(announcement.infections)){
      throw new Error(`'infections' in entry ${idx+1} is not an array`);
    }
    if(!Array.isArray(announcement.recoveries)){
      throw new Error(`'recoveries' in entry ${idx+1} is not an array`);
    }
    if(!Array.isArray(announcement.deaths)){
      throw new Error(`'deaths' in entry ${idx+1} is not an array`);
    }

    [
      'recoveries',
      'infections',
      'deaths',
    ].forEach((name) => {
      const map = new Map();
      announcement[name].forEach((r, r_idx) => {
        if(typeof r.number !== "number"){
          throw new Error(`'${name}' entry ${r_idx+1} in announcement ${idx+1}: 'number' is not a number`);
        }
        if(typeof r.city !== "string"){
          throw new Error(`'${name}' entry ${r_idx+1} in announcement ${idx+1}: 'city' is not a string`);
        }
        if(!known_cities[r.city] && r.city !== 'Unknown')
        {
          throw new Error(`'${name}' entry ${r_idx+1} in announcement ${idx+1}: '${r.city}' is unknown city.`);
        }
        map.set(r.city, (map.get(r.city) || 0) + r.number);
      });
      announcement[name] = Array.from(map.entries())
        .map(e => ({city:e[0], number:e[1]}))
        .sort((b, a) => a.number - b.number);
    });
  });
  data.announcements = data.announcements.sort((a, b) => a.date - b.date);
}

function get_saudi_moh_data(){
  let SaudiMOH_Raw = require("../saudi_moh_raw_data");
  
  validate_and_enhance_raw_data(SaudiMOH_Raw);

  return SaudiMOH_Raw;
}

module.exports = {
  get_saudi_moh_data,
};
