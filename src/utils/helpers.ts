
interface DateValue {
  dateString: string;
  timestamp: number;
}
function getDate() : DateValue {
  const date = new Date();
  return {
    dateString: `${date.getFullYear()}-${date.getMonth()}-${date.getDay()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`,
    timestamp: Math.floor(date.getTime() / 1000)
  }
}

export default getDate;