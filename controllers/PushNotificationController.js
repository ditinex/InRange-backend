var admin = require('firebase-admin');
var serviceAccount = require("../inrange-firebase-adminsdk-4t531-7cc25340a1.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://inrange.firebaseio.com"
});

const HandleSend = (message) =>{ 
    admin.messaging()
        .send(message)
        .then(response => {
            console.log(response)
        })
        .catch(error => {
          console.log(error);
        });
}

const PushTextNotification = async(title,description,tokens,image_url) => {

    try{
        const message = {
            token: tokens[0],
            notification: {
              body: description,
              title: title,
            },
            data: {type: 'notification'},
            android: {
              notification: {
                image: image_url,
                icon: "https://i.ibb.co/whw04F9/Icon.png",
              },
              priority: "high",
              restrictedPackageName: "com.inrangeit"
            },
            apns: {
              payload: {
                aps: {
                  'mutable-content': true,
                },
              },
              fcm_options: {
                image: image_url,
              },
            }
        };

      await HandleSend(message);
        
    }
    catch (err){
        console.log(err)
    }

}

const PushMessage = async(title,description,tokens,collapseId) => {

    try{
      const message = {
        token: tokens[0],
        notification: {
          body: description,
          title: title,
        },
        data: {type: 'chat'},
        android: {
          notification: {
            icon: "https://i.ibb.co/whw04F9/Icon.png",
          },
          priority: "high",
          restrictedPackageName: "com.inrangeit",
          collapseKey: collapseId
        },
        apns: {
          payload: {
            aps: {
              'mutable-content': true,
            },
          }
        }
    };

      await HandleSend(message);
    }
    catch (err){
        console.log(err)
    }

}

exports.PushTextNotification = PushTextNotification
exports.PushMessage = PushMessage