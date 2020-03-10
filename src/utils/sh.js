//时间搓转化
export function formatDate(date) {
    var date = new Date(date*1000);
    var myyear = date.getFullYear();
    var mymonth = date.getMonth() + 1;
    var myweekday = date.getDate();
    var myHour = date.getHours();
    var myMinute = date.getMinutes();
    var mySecond = date.getSeconds();
    if (mymonth < 10) {
        mymonth = "0" + mymonth;
    }
    if (myweekday < 10) {
        myweekday = "0" + myweekday;
    }
    if (myHour < 10) {
      myHour = "0" + myHour;
    }
    if (myMinute < 10) {
      myMinute = "0" + myMinute;
    }
    if (mySecond < 10) {
      mySecond = "0" + mySecond;
    }
    return (myyear+"-"+mymonth+"-"+myweekday+" "+myHour+":"+myMinute+":"+mySecond)
}
