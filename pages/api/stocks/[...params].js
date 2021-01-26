const csv = require('csv-parser');
const fs = require('fs');


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
async function executeGetStock(res, source, symbol, just_values){
 
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
  let results = [];
  return new Promise(async (resolve) => {
      fs.createReadStream('./storage/list_stocks.csv')
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
          resolve(results)
      });

  });
}

async function search(symbol) {
  return new Promise(async (resolve) => {
      const stocks = await getAllStocks();
      resolve(stocks.filter(s => s.Symbol.includes(symbol)));
  });
}

async function getStock(source, symbol, just_values) {
  console.log("GET STOCKS2")
  return new Promise(async (resolve) => {
      let results = [];
      fs.createReadStream(`./storage/${source}/${symbol}.csv`)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
          if(just_values){
              console.log(results)
              resolve(results)
          }else{
              const stocks = await getAllStocks();
              const stock = stocks.filter(s => s.Symbol == symbol)[0];
              stock['data'] = results;
              resolve(stock)
          }

          
      });
  });
}