const fetch = require('node-fetch');
const Config = require('../config.js');

const APP_ID = Config.onsignal_appid;

const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Authorization": "Basic " + Config.onsignal_apikey
};

const HandleSend = (body) =>{
    fetch('https://onesignal.com/api/v1/notifications', {
        method: "POST",
        body: body,
        headers: headers,
    })
    .then(res => res.json())
    .then(json => {
        //console.log(json)
    })
    .catch(err => console.error(err));
}

const PushTextNotification = async(title,description,players) => {

    try{
        const body = JSON.stringify({
            "app_id" : APP_ID,
            "headings" : {"en": title},
            "contents": {"en": description},
            "include_player_ids": players,
            "data": {type: 'notification'},
            "large_icon": "https://i.ibb.co/MMVSRRR/icon.png",
            "android_group": "notification",
            "android_group_message": {"en": "You have $[notif_count] new messages"},
        })

        await HandleSend(body);
    }
    catch (err){
        console.log(err)
    }

}

const PushMessage = async(title,description,players) => {

    try{
        const body = JSON.stringify({
            "app_id" : APP_ID,
            "headings" : {"en": title},
            "contents": {"en": description},
            "include_player_ids": players,
            "data": {type: 'chat'},
            "large_icon": "https://i.ibb.co/MMVSRRR/icon.png"
        })

        await HandleSend(body);
    }
    catch (err){
        console.log(err)
    }

}

exports.PushTextNotification = PushTextNotification
exports.PushMessage = PushMessage