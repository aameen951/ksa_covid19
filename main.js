const fs = require('fs');
const { get_saudi_moh_data } = require("./processing/saudi_moh_raw_data_processor");
const { gen_ksa_data, gen_ksa_data_v2 } = require("./gen_ksa_data");
const { arcgis_download_data } = require("./processing/arcgis_downloader");
const child_process = require("child_process");

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

async function gen_output_file(file_name, data){
  try{
    fs.mkdirSync("./output");
  }catch(e){}
  fs.writeFileSync(`./output/${file_name}.json`, JSON.stringify(data, null, 2), "utf8");
}
async function read_file(file_name){
  const result = fs.readFileSync(`./output/${file_name}.json`, "utf8");
  return JSON.parse(result);
}

async function show_data()
{
  const data = await read_file('ksa_data_v2');

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
    console.log(city.name_eng.padEnd(28, " "), [
      ["infections", `${city.infections}`, "\x1b[33m"],
      ["recoveries", `${city.recoveries}`, "\x1b[32m"],
      ["deaths", `${city.deaths}`, "\x1b[31m"],
    ].map(x => `${x[0]}: ${x[2]}${x[1].padStart(5, " ")}\x1b[0m`).join(", "));
  }
  console.log(`Data Source: \x1b[34m${data.data_source}\x1b[0m`);
  console.log(`Last Update: \x1b[32m${new Date(data.last_update).toLocaleString()}\x1b[0m`);
}
async function show_day()
{
  const data = await read_file('ksa_data_v2');
  const last_update = new Date(data.last_update);
  const from = new Date(data.last_update);
  from.setHours(from.getHours()-12);
  
  const cities = new Map();
  const total = {
    name: "TOTAL",
    infections: 0,
    recoveries: 0,
    deaths: 0,
  };
  Object.entries(data.cities).forEach(([k, v]) => {
    v.records.forEach(r => {
      if(r[0] >= from)
      {
        if(!cities.has(k))
        {
          cities.set(k, {
            name: k,
            infections: 0,
            recoveries: 0,
            deaths: 0,
          });
        }
        const city = cities.get(k);
        city.infections += r[1];
        city.recoveries += r[2];
        city.deaths += r[3];
        total.infections += r[1];
        total.recoveries += r[2];
        total.deaths += r[3];
      }
    });
  });
  const all_entries = [
    total,
    ...Array.from(cities.values()).sort((b, a) => a.infections - b.infections),
  ];
  ORG = "\x1b[33m";
  GRN = "\x1b[32m";
  RED = "\x1b[31m";
  DEF = "\x1b[0m";
  console.log("+------------------------------+------------+---------+--------+");
  console.log("|             Name             | Recoveries |  Cases  | Deaths |");
  console.log("+------------------------------+------------+---------+--------+");
  all_entries.forEach(e => {
    const name = e.name.padEnd(28, ' ');
    const infections = `${ORG}${`${e.infections}`.padStart(4, ' ')}${DEF}`;
    const recoveries = `${GRN}${`${e.recoveries}`.padStart(4, ' ')}${DEF}`;
    const deaths = `${RED}${`${e.deaths}`.padStart(4, ' ')}${DEF}`;
    const line = `| ${name} |    ${recoveries}    |  ${infections}   | ${deaths}   |`;
    console.log(line);
    if(e.name === "TOTAL")
      console.log("+------------------------------+------------+---------+--------+");
  });
  console.log("+------------------------------+------------+---------+--------+");
}

async function exec_process(cmd)
{
  const output = await new Promise((resolve, reject) => {
    child_process.exec(cmd, (err, stdout, stderr) => {
      if(err)reject(err);
      resolve({stdout, stderr});
    });
  });
  return output;
}
async function check_if_data_changed()
{
  const output = await exec_process("git status --porcelain=1");
  const status_lines = output.stdout.split("\n");
  for(let line of status_lines)
  {
    const filename = line.slice(3);
    if(filename === 'output/ksa_data_v2.json')
    {
      return true;
    }
  }
  return false;
}
async function do_commit(){
  const data = await read_file("ksa_data_v2");
  const last_update = new Date(data.last_update).toLocaleString();
  const now = new Date().toLocaleString();

  console.log("\n------------------------------------");
  console.log(` *     \x1b[33mDetected data change!\x1b[0m      *`);
  console.log("\n------------------------------------");
  console.log("Now:       \x1b[34m", now, "\x1b[0m");
  console.log("NewUpdate: \x1b[32m", last_update, "\x1b[0m");
  console.log((await exec_process("git add output/ksa_data_v2.json")).stdout);
  console.log((await exec_process(`git commit -m "Update at ${last_update}."`)).stdout);
  console.log((await exec_process(`git push`)).stdout);
  console.log("------------------------------------\n");
}
async function periodic_check()
{
  console.log("Fetching data...");
  await main(['fetch']);
  const data_changed = await check_if_data_changed();
  if(data_changed)
  {
    await show_day();
    console.log();
    do_commit();
  }
}
async function main(args){
  const command = args[0];
  const params = args.slice(1);
  
  switch(command)
  {
    case 'gen':{
      const data = get_saudi_moh_data();

      gen_output_file('saudi_moh_data', data);
  
      gen_output_file('ksa_data', gen_ksa_data(data));
    }break;
    case 'fetch':{
      let data = await arcgis_download_data();
      data = gen_ksa_data_v2(data);
      await gen_output_file('ksa_data_v2', data);

      if(params.find(x => x == '--show'))
      {
        await show_data();
      }
      else if(params.find(x => x == '--show-day'))
      {
        await show_day();
      }
    }break;
    case 'show':{
      await main(['fetch', '--show']);
    }break;
    case 'show-day':{
      await main(['fetch', '--show-day']);
    }break;
    case 'watch':{
      await new Promise(async (resolve, reject) => {

        await periodic_check();

        setInterval(async () => {

          await periodic_check();
      
        }, 10 * 60 * 1000);

      });
    }break;
    default: {
      usage();
    }
  }
}

main(process.argv.slice(2));
