const Discord = require("discord.js");
const axios = require("axios");
const stringify = require('json-stringify')
const querystring = require('querystring');

const bot = new Discord.Client();
const token = require('./config/local.json').token;

bot.on("message", msg => {
  let prefix = "!";

  var name = msg.content.slice(msg.content.indexOf(" ") + 1);
  var name1 = name.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });

  if (msg.content.startsWith(prefix + "card")) {
    axios.get('http://yugiohprices.com/api/card_data/' + name1)
      .then(function(response) {

        setUpCards(response, name1, msg);

      })
      .catch(function(error) {
        errMsg(name, msg);
      });
  }

  if (msg.content.startsWith(prefix + "wbp")) {
    if (name1.includes('Helm')) {
      name1 = name1.substr(0, name1.indexOf('Helm')) + 'Neuroptics';
    } else if (name1.includes('Bp')) {
      name1 = name1.substr(0, name1.indexOf('Bp')) + 'Blueprint';
    }
    axios.get('http://warframe.market/api/get_orders/Blueprint/' + name1)
      .then(function(response) {

        setUp(response, name1, msg);

      })

      .catch(function(error) {
        errMsg(name, msg);
      });
  }

  if (msg.content.startsWith(prefix + "wmod")) {
    var point1 = 'http://warframe.market/api/get_orders/Mod/';
    var point2 = 'https://warframe.market/api/get_orders/Void%20Trader/';
    var point3 = '';
    if (name1.includes('Primed')) {
      point3 = point3.concat(point2);
    } else {
      point3 = point3.concat(point1);
    }
    axios.get(point3 + name1)
      .then(function(response) {

        setUpMod(response, name1, msg);

      })

      .catch(function(error) {
        errMsg(name, msg);
      });
  }

  if (msg.content.startsWith(prefix + "wset")) {
    axios.get('http://warframe.market/api/get_orders/Set/' + name1 + " Set")
      .then(function(response) {

        setUp(response, name1, msg);

      })

      .catch(function(error) {
        errMsg(name, msg);
      });
  }

  if (msg.content.startsWith(prefix + "add")) {
    var uid = msg.author.username + "#" + msg.author.discriminator;
    axios.post('http://localhost:8080/api/users/',
        querystring.stringify({
          name: uid,
          profile: ''
        }), {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        })
      .then(function(response) {
        msg.channel.sendMessage(msg.author + " Added to the database");
      })
      .catch(function(error) {
        console.log(error);
        msg.channel.sendMessage(msg.author + "Something broke");
      });
  }

  if (msg.content.startsWith(prefix + "pid")) {
    var fc = name;
    var uid = msg.author.username + "#" + msg.author.discriminator;
    var ppl = [];
    axios.get('http://localhost:8080/api/users/')
      .then(function(response) {
        var lst = response.data;
        for (q = 0; q < lst.length; q++) {
          ppl.push(lst[q]);
        }
        for (i = 0; i < ppl.length; i++) {
          if (ppl[i].name == uid) {
            axios.put('http://localhost:8080/api/users/' + ppl[i]._id,
                querystring.stringify({
                  name: uid,
                  profile: fc
                }), {
                  headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                  }
                })
              .then(function(response) {
                msg.channel.sendMessage(msg.author + " Added " + fc + " to the database");
              })
              .catch(function(error) {
                console.log(error);
                msg.channel.sendMessage(msg.author + " Couldn't add");
              })
          }
        }
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  if (msg.content.startsWith(prefix + "myid")) {
    var uid = msg.author.username + "#" + msg.author.discriminator;
    var ppl = [];
    axios.get('http://localhost:8080/api/users/')
      .then(function(response) {
        var lst = response.data;
        for (q = 0; q < lst.length; q++) {
          ppl.push(lst[q]);
        }
        for (i = 0; i < ppl.length; i++) {
          if (ppl[i].name == uid) {
            msg.channel.sendMessage(msg.author + ' id is ' + ppl[i].profile);
          }
        }
      })
      .catch(function(error) {
        console.log(error);
      });
  }
});

function setUpCards(response, name1, msg) {
  var card = response.data.data;
  var link = card.name.replace(" ", "+")

  if (card.card_type == "monster") {
    msg.channel.sendMessage("```" +
      "Name: " + card.name + " \n" +
      "Attribute: " + card.family + "\n" +
      "Level/Rank: " + card.level + "\n" +
      "Type: " + card.type + "\n" +
      "Atk: " + card.atk + "\n" +
      "Def: " + card.def + "\n" +
      "Text: " + card.text + "\n\n" +
      "```\n\n" +
      "http://yugiohprices.com/card_price?name=" + link
    );
  } else {
    var type = card.property;
    if (card.property == null) {
      type = "normal";
    }
    msg.channel.sendMessage("```" +
      "Name: " + card.name + "\n" +
      "Card Type: " + card.card_type + "\n" +
      "Type: " + type + "\n" +
      "Effect: " + card.text + "\n\n" +
      "```\n\n" +
      "http://yugiohprices.com/card_price?name=" + link
    );
  }
};

function setUp(response, name1, msg) {
  var list = response.data.response.sell;
  var sell = [];

  for (i = 0; i < list.length; i++) {
    if (list[i].online_ingame == true) {
      sell.push(list[i]);
    }
  }P
  sell.sort(function(a, b) {
    return parseInt(a.price) - parseInt(b.price);
  });

  var sellers = "";

  for (k = 0; k < sell.length; k++) {
    sellers = sellers.concat(sell[k].ingame_name + "	Price: " + sell[k].price + "\n");
  }

  var mesg = "```" + "\n" + name1 + "\n" + sellers + "```";

  msg.channel.sendMessage(mesg);
};

function setUpMod(response, name1, msg) {
  var list = response.data.response.sell;
  var sell = [];

  for (i = 0; i < list.length; i++) {
    if (list[i].online_ingame == true) {
      sell.push(list[i]);
    }
  }

  sell.sort(function(a, b) {
    return parseInt(a.price) - parseInt(b.price);
  });

  var sellers = "";

  for (k = 0; k < sell.length; k++) {
    sellers = sellers.concat(sell[k].ingame_name + "	Price: " + sell[k].price + "	Rank: " + sell[k].mod_rank + "\n");
  }

  var mesg = "```" + "\n" + name1 + "\n" + sellers + "```";

  msg.channel.sendMessage(mesg);
};

function errMsg(name, msg) {
  msg.channel.sendMessage("```" +
    "Cannot find " + name + "\n" +
    "Have you spelled the name correctly?\n" +
    "```"
  );
  console.log(error);
};

bot.on('ready', () => {
  console.log('Bot is ready');
});

bot.login(token);