const axios = require("axios");

const ARCGIS_COVID_CASES_URL = "https://services8.arcgis.com/uiAtN7dLXbrrdVL5/arcgis/rest/services/Saudi_COVID19_Cases/FeatureServer/1/query";
const ARCGIS_COVID_CASES_DEFAULT_PARAMS = {
  f: "json",
  where: "1=1",
  returnGeometry: false,
  spatialRel: "esriSpatialRelIntersects",
  outFields: "*",
  orderByFields: "Reportdt asc",
  resultOffset: 0,
  resultRecordCount: 1000,
  cacheHint: true,
};

async function arcgis_download_data()
{
  let result = [];

  let start = 0;
  while(true)
  {
    ARCGIS_COVID_CASES_DEFAULT_PARAMS.resultOffset = start;

    const response = await axios.default.get(ARCGIS_COVID_CASES_URL, {
      params: ARCGIS_COVID_CASES_DEFAULT_PARAMS,
      responseType: "json",
    });
    const response_data = response.data;
    result.push(...response_data.features.map(f => f.attributes));
    start += response_data.features.length;

    if(!response_data.exceededTransferLimit)break;
  }
  result.forEach(d => d.Reportdt = new Date(d.Reportdt));
  result = result.sort((a, b) => a.Reportdt - b.Reportdt);
  return result;
}

module.exports = {
  arcgis_download_data,
};
