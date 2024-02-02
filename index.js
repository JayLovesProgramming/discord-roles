/// <reference path="node_modules/@citizenfx/server/index.d.ts" />
const axios = require('axios').default;
const config = require('./config.json');
const { geInfinite } = require('./errors');
let canRun = false;

axios.defaults.baseURL = 'https://discord.com/api/v8';
axios.defaults.headers = {
  Authorization: `Bot ${config.discordData.token}`,
  'Content-Type': 'application/json'
};

if (config.debug) {
  axios.interceptors.request.use(function (config) {
    // console.log(`^3[discordroles | DEBUG] ${config.method} ${config.url}^7\n`);
    return config;
  });  
}

axios.interceptors.response.use((res) => (res), (err) => {
  if (err.response.status !== 404)
    // console.log(`\n^1[discordroles] request to discord API failed.\n  • ${geInfinite(err)}^7\n`);
  return Promise.reject(err);
});

async function validateToken() {
  const res = await axios('/users/@me');
  if (res.data.id) {
    // console.log(`\n^2[discordroles] successfully validated bot token.\n  ^7• Current account: ^6${res.data.username}#${res.data.discriminator} (${res.data.id})^7\n`);
    canRun = true;
  }
}

function getUserDiscord(user) {
  if (typeof user === 'string') return user;
  if (!GetPlayerName(user)) return false;
  for (let idIndex = 0; idIndex <= GetNumPlayerIdentifiers(user); idIndex ++) {
    if (GetPlayerIdentifier(user, idIndex).indexOf('discord:') !== -1) return GetPlayerIdentifier(user, idIndex).replace('discord:', '');
  }
  return false;
}

exports('isRolePresent', (user, role, ...args) => {
  if (!canRun) return console.log('^1[discordroles] authentication error, exports wont run.^7');
  const isArgGuild = typeof args[0] === 'string';
  const selectedGuild = isArgGuild ? args[0] : config.discordData.guild;
  const discordUser = getUserDiscord(user); 
  if (!discordUser) return isArgGuild ? args[1](false) : args[0](false);
  axios(`/guilds/${selectedGuild}/members/${discordUser}`).then((res) => {
    const hasRole = typeof role === 'string' ? res.data.roles.includes(role) : res.data.roles.some((curRole, index) => res.data.roles.includes(role[index]));
    isArgGuild ? args[1](hasRole, res.data.roles) : args[0](hasRole, res.data.roles);
  }).catch((err) => {
    if (err.response.status === 404) {
      isArgGuild ? args[1](false) : args[0](false);
    }
  });
});

exports('getUserRoles', (user, ...args) => {
  if (!canRun) return console.log('^1[discordroles] authentication error, exports wont run.^7');
  const isArgGuild = typeof args[0] === 'string';
  const selectedGuild = isArgGuild ? args[0] : config.discordData.guild;
  const discordUser = getUserDiscord(user);

  if (!discordUser) return isArgGuild ? args[1](false) : args[0](false);

  // Fetch guild roles
  axios(`/guilds/${selectedGuild}/roles`)
    .then((roleRes) => {
      const guildRoles = roleRes.data;

      // Fetch user roles
      axios(`/guilds/${selectedGuild}/members/${discordUser}`)
        .then((res) => {
          const userRolesIDs = res.data.roles;

          // Map role IDs to role names
          const userRolesNames = userRolesIDs.map((roleID) => {
            const role = guildRoles.find((guildRole) => guildRole.id === roleID);
            return role ? role.name : null;
          });

          isArgGuild ? args[1](userRolesNames) : args[0](userRolesNames);
        })
        .catch((err) => {
          if (err.response.status === 404) {
            isArgGuild ? args[1](false) : args[0](false);
          }
        });
    })
    .catch((err) => {
      console.error(err);
    });
});

// Added by Jay 
exports('getUserRoleIDs', (user, ...args) => {
  if (!canRun) return console.log('^1[discordroles] authentication error, exports wont run.^7');
  const isArgGuild = typeof args[0] === 'string';
  const selectedGuild = isArgGuild ? args[0] : config.discordData.guild;
  const discordUser = getUserDiscord(user);
  if (!discordUser) return isArgGuild ? args[1](false) : args[0](false);
  // Fetch user roles
  axios(`/guilds/${selectedGuild}/members/${discordUser}`)
    .then((res) => {
      const userRolesIDs = res.data.roles;
      isArgGuild ? args[1](userRolesIDs) : args[0](userRolesIDs);
    })
    .catch((err) => {
      if (err.response.status === 404) {
        isArgGuild ? args[1](false) : args[0](false);
      }
    });
});

exports('getUserData', (user, ...args) => {
  if (!canRun) return console.log('^1[discordroles] authentication error, exports wont run.^7');
  const isArgGuild = typeof args[0] === 'string';
  const selectedGuild = isArgGuild ? args[0] : config.discordData.guild;
  const discordUser = getUserDiscord(user); 
  if (!discordUser) return isArgGuild ? args[1](false) : args[0](false);
  axios(`/guilds/${selectedGuild}/members/${discordUser}`).then((res) => {
    isArgGuild ? args[1](res.data) : args[0](res.data);
  }).catch((err) => {
    if (err.response.status === 404) {
      isArgGuild ? args[1](false) : args[0](false);
    }
  });
});

validateToken();
