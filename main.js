const fs = require('fs');
const { get_saudi_moh_data } = require("./processing/saudi_moh_raw_data_processor");
const { gen_ksa_data, gen_ksa_data_v2 } = require("./gen_ksa_data");
const { arcgis_download_data } = require("./processing/arcgis_downloader");

function usage(){
  console.log();
  console.log("Usage: ");
  console.log("   node main <command>");
  console.log();
  console.log("Commands:");
  console.log("   gen      Generate data from raw data.");
  console.log("   fetch    Download data from ArcGIS and generate ksa_data_v2.json.");
  console.log("   show     Download data from ArcGIS and show it.");
  console.log();
}

function gen_output_file(file_name, data){
  try{
    fs.mkdirSync("./output");
  }catch(e){}
  fs.writeFileSync(`./output/${file_name}.json`, JSON.stringify(data, null, 0), "utf8");
}

async function main(args){
  if(args[0] === 'gen')
  {
    const data = get_saudi_moh_data();

    gen_output_file('saudi_moh_data', data);

    gen_output_file('ksa_data', gen_ksa_data(data));
  }
  else if(args[0] === 'fetch')
  {
    let data = await arcgis_download_data();

    gen_output_file('ksa_data_v2', gen_ksa_data_v2(data));
  }
  else if(args[0] === 'show')
  {
    let raw_data = await arcgis_download_data();
    let data = gen_ksa_data_v2(raw_data);
    const entries = [
      ...Object.entries(data.cities).map(x => x[1]).sort((a, b) => a.infections-b.infections),
      {
        name_eng: "TOTAL",
        infections: data.infections,
        recoveries: data.recoveries,
        deaths: data.deaths,
      }
    ];
    for(let city of entries)
    {
      console.log(city.name_eng.padEnd(20, " "), [
        ["infections", `${city.infections}`, "\x1b[33m"],
        ["recoveries", `${city.recoveries}`, "\x1b[32m"],
        ["deaths", `${city.deaths}`, "\x1b[31m"],
      ].map(x => `${x[0]}: ${x[2]}${x[1].padStart(5, " ")}\x1b[0m`).join(", "));
    }
    console.log(`Data Source: \x1b[34m${data.data_source}\x1b[0m`);
    console.log(`Last Update: \x1b[32m${new Date(data.last_update).toLocaleString()}\x1b[0m`);
  }
  else
  {
    usage();
  }
}

main(process.argv.slice(2));
