fx_version 'bodacious'
games { 'gta5', 'rdr3' }
lua54 'yes' -- Needed to upload as a FiveM CFX script
version '1.0.0'
dependency 'yarn'
server_scripts {
  'index.js',
}
server_exports {
  'isRolePresent',
  'getUserRoles',
  'getUserData',
}
escrow_ignore {
  'config.lua'
}
use_experimental_fxv2_oal 'yes'
