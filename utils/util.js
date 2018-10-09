const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

var mServerTime = 0;

function update(url){
	console.log(url)
}

function formatStr(str){  //去掉换行符
  if(typeof str == 'string'){
    let i = str.indexOf("{")
    let datas = JSON.parse(str.substring(i,str.length));
    return datas;
  }else{
    return str;
  }
}
function urlStr(str){
  let i = str.lastIndexOf("/")
  let datas = str.substring(0,i)
  return datas + '/132'
}
function setServerTime(tick){
    let date = new Date();
    mServerTime = tick - Math.floor(date.getTime()/1000);
}

function getServerTime(){
    let date = new Date();
    if(mServerTime <= 0)
        return Math.floor(date.getTime()/1000);
    return mServerTime + Math.floor(date.getTime()/1000);
}
function strTime(time){
  let str;
  if(time >= 86400){
    str = Math.floor(time/86400) + '天前'
  }else if(time >= 3600 && time < 86400){
    str = Math.floor(time/3600) + '小时前'
  }else if(time >= 60 && time < 3600){
    str = Math.floor(time/60) + '分钟前'
  }else if(time < 60){
    str = time + '秒前'
  }
  return str;
}
function getTime(nS) {  
  var date=new Date(parseInt(nS)* 1000);  
  var year=date.getFullYear(); 
  var mon = date.getMonth()+1; 
  var day = date.getDate(); 
  var hours = date.getHours(); 
  var minu = date.getMinutes(); 
  var sec = date.getSeconds(); 
   
  return year+'-'+mon+'-'+day+' '+hours+':'+minu+':'+sec; 
} 
function widthScale(){   //宽度比例
  let width = wx.getStorageSync('windowWidth');
  let scr = width/750;
  return scr;
}
function queryIndex(obj,key,value){  //查询对象中数组某元素下标
  let j;
  for(j in obj){
    if(obj[j][key] == value){
      return j;
    }
  }
}
function strToObj(str){
  let arr = str.split("&");
  let urlObject = {};
  for (let i=0; i<arr.length; i++) { 
    var urlItem = arr[i]; 
    var item = urlItem.split("="); 
    urlObject[item[0]] = item[1]; 
    } 
  return urlObject; 
}
function toDecimal2(x) {    
	var f = parseFloat(x);    
	if (isNaN(f)) {    
		return false;    
	}    
	var f = Math.round(x*100)/100;    
	var s = f.toString();    
	var rs = s.indexOf('.');    
	if (rs < 0) {    
		rs = s.length;    
		s += '.';    
	}    
	while (s.length <= rs + 2) {    
		s += '0';    
	}    
	return s;    
}

function formatDate(year, month, day) {
  if (month < 10) {
    month = "0" + month;
  }
  if (day < 10) {
    day = "0" + day;
  }
  let nowDate = year + "-" + month + "-" + day;
  return nowDate;
}

function substr(str) {
  if (str.length > 5) {
    str = str.substr(0, 5) + '...';
  }
  return str;
}

module.exports = {
  formatTime: formatTime,
  formatStr:formatStr,
  getTime:getTime,
  urlStr:urlStr,
  update:update,
  setServerTime:setServerTime,
  getServerTime:getServerTime,
  strTime:strTime,
  widthScale:widthScale,
  queryIndex:queryIndex,
  strToObj:strToObj,
  toDecimal2:toDecimal2,
  formatDate:formatDate,
  substr:substr
}