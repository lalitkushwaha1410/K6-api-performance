
const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');

const finder = require('findit')('./');
const groupBy = (list, getKey) => {
  const arrayReturn = [];
  list.forEach((currentItem) => {
    const group = getKey(currentItem);
    let exisitingRecord = arrayReturn.filter((x) => x.index === group)[0] || null;
    if (!exisitingRecord) {
      exisitingRecord = {
        index: group,
        list: [],
      };
      arrayReturn.push(exisitingRecord);
    }
    exisitingRecord.list.push(currentItem);
  });
  return arrayReturn;
};

const getTag = (tagName, tags) => {
  const tempTag = tags.filter(x => x.startsWith(tagName))[0];
  if (!tempTag) { return -1 };
  const value = tempTag.split('=')[1]
  return parseInt(value);
}
const fillInHtmlReport = (seriesData, fileName) => {

  fs.readFile('./src/javascripts/load-test-report.html', 'utf8', function (err, data) {
    if (err) throw err;
    let dataNew = data.replace('replaceMe', JSON.stringify(seriesData))
    dataNew = dataNew.replace('replaceFileName', `${fileName.replace('.csv', '')}`)

    fs.writeFile(`./results/${fileName.replace('csv', 'html')}`, dataNew, (err) => {
      if (err) console.log(err);
      else {
        console.log(`File written successfully ${fileName.replace('csv', 'html')}\n`);
      }
    });
  });
}
finder.on('file', function (file) {
  if (file.endsWith('.csv')) {
    const dataPoints = [];
    const vusPoints = [];
    const responsePoints = [];

    console.log('file found' + file)
    fs.createReadStream(file)
      .pipe(csv.parse({ headers: true }))
      .on('error', error => console.error(error))
      .on('data', row => {
        if (row.metric_name === 'vus') {
          const vusCount = row.metric_value;
          const vusTimestamp = row.timestamp;
          vusPoints.push({ timestamp: vusTimestamp, value: vusCount });
        }

        if (row.metric_name === 'http_reqs') {
          const result= row.status
          dataPoints.push({ endTimeStamp:row.timestamp,result});
        }

        if (row.metric_name === 'http_req_duration') {
          const metric_value= row.metric_value
          responsePoints.push({ endTimeStamp:row.timestamp, metric_value});
        }
      
      })


      .on('end', rowCount => {

        // do some magic
        const seriesData = {
          vus: [],
          xaxis: [],
          response: []
        }
        const resultCodes = groupBy(dataPoints, x => x.result).map(x => x.index);
        resultCodes.forEach(code => {
          seriesData[`code-${code}`] = [];
        })

        vusPoints.forEach(vuPoint => {
          const results = dataPoints.filter(x => x.endTimeStamp.toString() === vuPoint.timestamp);
          const responseresult = responsePoints.filter(x => x.endTimeStamp.toString() === vuPoint.timestamp);

          const groupedResults = groupBy(results, x => x.result)
          seriesData.vus.push(vuPoint.value)
          if (!seriesData.xaxis) {
            seriesData.xaxis = [];
          }
          seriesData.xaxis.push(vuPoint.timestamp)

          if (!seriesData.response) {
            seriesData.response = [];
          }

          if(responseresult.length > 0){
            responseresult.forEach(rr=>{seriesData.response.push(rr.metric_value)})
          
          }

          const counted = groupedResults.map(x => {
            return {
              resultValue: x.index,
              resultSum: x.list.length
            }
          })

          resultCodes.forEach(code => {
            const currentResult = counted.filter(x => x.resultValue === code)[0];

            seriesData[`code-${code}`].push(currentResult ? currentResult.resultSum : 0);
          })
          
        });
        fillInHtmlReport(seriesData, file);
      });
  }
});