const csv = require('csv-parser');
const fs = require('fs');

module.exports = {
    getStock: async (source, symbol, just_values) => {
        return await getStock(source, symbol, just_values);
    },
    search: async (symbol) => {
        return await search(symbol);
    },
    getAllStocks: async () => {
        return await getAllStocks();
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
    return new Promise(async (resolve) => {
        let results = [];
        fs.createReadStream(`./storage/${source}/${symbol}.csv`)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            if(just_values){
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

