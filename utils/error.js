const errcode = {
    '-1':'非法调用',
    '-2':'Session错误',
    '-101':'数据库忙',
    '-3':'参数错误',
    '-4':'照片上传失败',
    '-5':'照片格式或者照片大小不符合。大小最大2M',
    '-6':'画作上传失败',
    '-7':'画作格式或者大小不符合，大小1M',
    '-8':'只能点赞一次'
}

function queryErr(code){
    if(typeof errcode[code] != 'undefined'){
        return errcode[code];
    }
    return 0;
}

module.exports = {
    queryErr: queryErr
}