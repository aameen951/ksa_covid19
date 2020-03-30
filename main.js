const fs = require('fs');
const { get_saudi_moh_data } = require("./processing/saudi_moh_raw_data_processor");
const { gen_ksa_data } = require("./gen_ksa_data");

function usage(){
  console.log();
  console.log("Usage: ");
  console.log("   node main <command>");
  console.log();
  console.log("Commands:");
  console.log("   gen      Generate data from raw data.");
  console.log();
}

function gen_output_file(file_name, data){
  try{
    fs.mkdirSync("./output");
  }catch(e){}
  fs.writeFileSync(`./output/${file_name}.json`, JSON.stringify(data, null, 2), "utf8");
}

function main(args){
  if(args[0] === 'gen')
  {
    const data = get_saudi_moh_data();

    gen_output_file('saudi_moh_data', data);

    gen_output_file('ksa_data', gen_ksa_data(data));
  }
  else
  {
    usage();
  }
}

main(process.argv.slice(2));
