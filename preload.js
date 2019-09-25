

const ObjectId = require('mongodb').ObjectId;
const CURRENT_USER_ID = ObjectId("5d89e316e6afd13e21b374e1");
const Location = window.location.pathname.split( "/" )[6];

window.addEventListener('DOMContentLoaded', () => {

  const MongoClient = require('mongodb').MongoClient;
  const assert = require('assert');

  const url = 'mongodb://localhost:27017';

  const dbName = 'chat';

  MongoClient.connect(url, function(err, client) {

    assert.equal(null, err);
    const db = client.db(dbName);

      if (Location === "register.html") {
        let Login = document.getElementById("Login");
        Login.addEventListener("click", function() {
          let NameInput = document.getElementById("NameInput").value;
          let NamePassword = document.getElementById("NamePassword").value;

          db.collection('contacts').findOne({name:NameInput, password:NamePassword}, (error, user) => {
            window.location = "index.html";
          })
        });
      }else if (Location === "index.html") {
          let loadConversation = contacts => {

            document.getElementById('chatZoneMe').innerHTML = "";
            document.getElementById('ContentbigIconProfile').innerHTML = `<div class="profile"><img class="bigIconProfile" src="${contacts.avatar}"/></div>`;

            const conversationIds = [ CURRENT_USER_ID, contacts._id]
            db.collection('messages').find({
              users:{
                $all:conversationIds,
                $size:conversationIds.length
              }
            }).sort({dateTime:1}).limit(20).toArray((error, res) => {
              res.forEach(m => {
                addMessage(m);
            });
          });
        }

        db.collection('contacts').find({ name:{$ne:"moi"}}).toArray((error, res) => {
          loadContacts(res)
        });

        let loadContacts = contacts => {
          contacts.forEach(c => {
          let contentContact = document.createElement('div')
          contentContact.className = "contentContact";
          contentContact.innerHTML = `<div class="iconContact"><img class="img" src="${c.avatar}"/></div><span>${c.name}</span>`;
          contentContact.addEventListener("click", function(event) {
            document.querySelectorAll('.contentContact.active').forEach(function(elem){
              elem.classList.remove("active")
            });
            contentContact.classList.add("active");
            loadConversation(c)

          }, false);
          document.getElementById('contacts').appendChild(contentContact);
          });
        }

      var take_snapshot = document.getElementById("take_snapshot");
        take_snapshot.addEventListener("click", function(event) {
          Webcam.snap( function(data_uri) {
            let photo = {

                  "users": [
                      ObjectId("5d89e316e6afd13e21b374e1"),
                      ObjectId("5d89e2e7e6afd13e21b374e0")
                  ],
                  "user": {
                      "name": "moi",
                      "avatar": "https://i.pravatar.cc/300?img=1"
                  },
                  "message": "",
                  "dateTime": new Date(),
                  "photo": data_uri
            };
            //console.log(photo)
            db.collection('messages').insertOne(photo, () => {addMessage(photo)})
          });

          Webcam.reset();
        })

        var input = document.getElementById("input");
        input.addEventListener("change", function(event) {
        if(event.target.value)
            {
              let message = {

                    "users": [
                        ObjectId("5d89e316e6afd13e21b374e1"),
                        ObjectId("5d89e2e7e6afd13e21b374e0")
                    ],
                    "user": {
                        "name": "moi",
                        "avatar": "https://i.pravatar.cc/300?img=1"
                    },
                    "message": event.target.value,
                    "dateTime": new Date()

              };

              db.collection('messages').insertOne(message, () => {addMessage(message)})
            }
        });

      }
  });
});


  let addMessage = m => {
    var ArrayMessages = document.querySelector('.chatZoneMe');
    let isMe = m.user.name === "moi" ;
    let me = document.createElement('div');
    me.className = isMe ? "me" : 'you';
    me.innerHTML = `<div class="iconChatZoneMe"><img class="img" src="${m.user.avatar}"/></div><div class="${isMe ? 'textChat' : 'textChatOther'}" style="background:${m.color}">${m.photo ? "<img src='" + m.photo + "'/> <br/>" : ""} ${m.message}</div>`;
    document.getElementById('chatZoneMe').appendChild(me);

}
