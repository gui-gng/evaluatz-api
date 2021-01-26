const csv = require('csvtojson')
const fs = require('fs');
const source_path = 'https://api.evaluatz.com';
// const source_path = 'http://localhost:3000';

export default async function handler(req, res) {
  const {
    query: { params },
  } = req

  switch (params[0]) {
    case "list":
      await list(res);
      break;
    case "search":
      await executeSearch(res, params[1]);
      break;
    default:
      const source = params[0]
      const symbol = params[1]
      await executeGetStock(res, source, symbol, false)
  }



}
async function executeGetStock(res, source, symbol, just_values) {

  try {
    const stocks = await getStock(source, symbol, just_values);

    res.send(stocks)
  } catch (error) {
    res.send(error);
  }
}

async function executeSearch(res, symbol) {
  console.log("Searching")
  try {
    const stocks = await search(symbol);
    res.send(stocks);
  } catch (error) {
    res.send(error);
  }
}


async function list(res) {
  try {
    const stocks = await getAllStocks();
    res.send(stocks);
  } catch (error) {
    res.send(error);
  }
}





async function getAllStocks() {
  return new Promise(async (resolve) => {
    const url = source_path + '/storage/list_stocks.csv';
    const response = await(await fetch(url)).text();
    const results = await csv().fromString(response);
    resolve(results);
  });
}

async function search(symbol) {
  return new Promise(async (resolve) => {
    const stocks = await getAllStocks();
    resolve(stocks.filter(s => s.symbol.includes(symbol)));
  });
}

async function getStock(source, symbol, just_values) {
  console.log("GET STOCKS2")
  return new Promise(async (resolve) => {
    const url = source_path + `/storage/${source}/${symbol}.csv`;
    const response = await(await fetch(url)).text();
    const results = await csv().fromString(response);

    if (just_values) {
      console.log(results)
      resolve(results)
    } else {
      const stocks = await getAllStocks();
      const stock = stocks.filter(s => s.symbol == symbol)[0];
      stock['data'] = results;
      resolve(stock)
    }
  });
}