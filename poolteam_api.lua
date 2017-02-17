--#ENDPOINT PUT /user/{email}
local ret = User.createUser({
    email = request.parameters.email,
    name = request.body.username,
    password = request.body.password
})

if ret.status ~= 200 and ret.status ~= nil  then
    response.code = ret.status
    response.message = ret.error
elseif ret.status ~= nil then
    response.code = ret.status_code
    response.message = ret.message
else
--  Get created user id
    local user_id = User.listUsers({filter={"email::like::" .. request.parameters.email}})[1].id
--  Create userData ("role": "guest") with given user id.
    local resp = User.createUserData({["id"]=user_id, ["role"]="guest"})
    if resp ~= nil and resp.status ~= nil then
      response.code = ret.status
      response.message = ret.error
    else
      response.code = 200
      response.message = ret
      local domain = string.gsub(request.uri, 'https?://(.-/)(.*)', '%1')
      local text = "Hi   " .. request.body.username .. ",\n"
      text = text .. "Click this link to verify your account:\n"
      text = text .. "https://" .. domain .. "verify/" .. ret;
      Email.send({
          from = 'POOLTEAM <mail@exosite.com>',
          to = request.parameters.email,
          subject = ("Signup on " .. domain),
          text = text
      })
    end
end

-- -------------------------------------------------------------------------------------------------------------------

--#ENDPOINT GET /verify/{code}
local ret = User.activateUser({code = request.parameters.code})
if ret == 'OK' then
  response.headers["Content-type"] = "text/html"
  response.message = '<html><head></head><body>Signed up successfully. <a href="/#/login">Log in</a></body></html>'
else
  response.message = 'Sign up failed. Error: ' .. ret.message
end

-- -------------------------------------------------------------------------------------------------------------------

--#ENDPOINT PATCH /user/{email}
local user = currentUser(request)
if user ~= nil then
  User.updateUserStorage({id = user.id, ["key values"] = request.body})
  User.createUserStorage({id = user.id, ["key values"] = request.body})
end

-- -------------------------------------------------------------------------------------------------------------------

--#ENDPOINT GET /user/{email}/recover
-- Process "password recovery request"
local email = request.parameters.email

local parameters = {
  filter = {"email::like::" .. email}
}

local users = User.listUsers(parameters)

if table.getn(users) == 0 then
  response.code = 404
  response.message = 'Not found'
else
  local code = random_string(20)
  -- Delete recovery user data before adding
  local parameters = {
    ["id"] = users[1].id,
    ["keys"] = {"recovery_time", "recovery_code"}
  }
  User.deleteUserData(parameters)
  -- Add recovery data
  parameters = {
    ["id"] = users[1].id,
    ["recovery_time"] = tostring(os.time()),
    ["recovery_code"] = code
  }
  User.createUserData(parameters)

  local domain = string.gsub(request.uri, 'https?://(.-/)(.*)', '%1')
  local text = "Hi   " .. users[1].name .. ",\n"
  text = text .. "Click this link to reset your password:\n"
  text = text .. "https://" .. domain .. "#/reset/" .. email .. "/" .. code;
  text = text .. "\n\nNOTE: This will be expired after 15 minutes."
  text = text .. "\n\n\nPOOLTEAM Service."
  Email.send({
      from = 'POOLTEAM <mail@exosite.com>',
      to = request.parameters.email,
      subject = ("Reset password"),
      text = text
  })
  response.code = 200
  response.message = 'OK'
end

-- -------------------------------------------------------------------------------------------------------------------

--#ENDPOINT POST /user/{email}/recover
-- Process "password recovery request"
local email = request.parameters.email
local code = request.body.code
local new_pwd = request.body.password

local parameters = {
  filter = {"email::like::" .. email}
}
local users = User.listUsers(parameters)

if table.getn(users) == 0 then
  response.code = 404
  response.message = 'User Not found'
else
  local parameters = {
    ["id"] = users[1].id,
    ["key"] = "recovery_time"
  }
  local recovery_time = User.getUserData(parameters)
  parameters = {
    ["id"] = users[1].id,
    ["key"] = "recovery_code"
  }
  local recovery_code = User.getUserData(parameters)

  if type(recovery_time) == "table" or type(recovery_code) == "table" then
    response.code = 404
    response.message = 'Not found recovery data'
  else
    if tonumber(recovery_time) - os.time() > 15 * 60 then   -- recovery will be expired in 15 min
      response.code = 400
      response.message = 'Recovery timeout.'
    elseif code ~= recovery_code then
      response.code = 400
      response.message = 'Invalid recovery code'
    else
      parameters = {
        ["id"] = users[1].id,
        ["password"] = new_pwd
      }
      response.message = User.resetUserPassword(parameters)
      parameters = {
        ["id"] = users[1].id,
        ["keys"] = {"recovery_time", "recovery_code"}
      }
      User.deleteUserData(parameters)
    end
  end
end

-- -------------------------------------------------------------------------------------------------------------------

--#ENDPOINT POST /session
local ret = User.getUserToken({
  email = request.body.email,
  password = request.body.password
})
if ret ~= nil and ret.status ~= nil then
  response.code = ret.status
  response.message = to_json(ret.error)
else
  response.headers = {
    ["Set-Cookie"] = "sid=" .. tostring(ret),
    -- This is for CORS(Cross Domain Request) in development.
    ["Access-Control-Allow-Headers"] = "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With",
    ["Access-Control-Allow-Headers"] = "X-Custom-Header, Content-Type, Accept, Authorization, Access-Control-Allow-Headers, Authorization, X-Requested-With",
    ["Access-Control-Allow-Origin"] = "http://localhost:8080",
--    ["Access-Control-Allow-Origin"] = "http://192.168.1.107:8080",
    ["Access-Control-Allow-Methods"] = "GET, POST",
  }

-- Get current user
  local user = User.listUsers({filter = {"email::like::" .. request.body.email}})[1]

-- Get user's role
  local role = User.getUserData({["id"] = user.id, ["key"] = "role"})

-- Users who were created in solution page will not have 'role' data.
-- We will grant 'admin' permission to them.
  if role ~= nil and role.status == 404 then
    User.createUserData({["id"]=user.id, ["role"]="admin"})
    role = "admin"
  end

  response.message = {["token"] = ret, ["name"] = user.name, ["role"] = role }

end

-- -------------------------------------------------------------------------------------------------------------------

--#ENDPOINT GET /session
--
local user = currentUser(request)
if user ~= nil and user.id ~= nil then
    return user
end
response.code = 400
response.message = "Session invalid"

-- -------------------------------------------------------------------------------------------------------------------

--#ENDPOINT POST /user/{email}/pools
-- Add a pool device.
-- This request is allowed only to administrators.
-- The pool must have already written in to the platform
local sn = tostring(request.body.serialnumber);
local name = request.body.name
local user = currentUser(request)

if user == nil or user.id == nil then
  http_error(403, response)
  return
elseif getUserRoleByEmail(request.parameters.email) ~= 'admin' then
  http_error(403, response)
  return
end

-- only add device if the Product event handler has
-- heard from it (see event_handler/product.lua)
local device = kv_read_opt(sn, false)
if device == nil then
  http_error(404, response)
  return
end

-- Check whether this device is already registered.
local device_list = {}
local resp = Keystore.get({key = "devices"})
if type(resp) == "table" and type(resp.value) == "string" then
  device_list = from_json(resp.value)
end

if device_list ~= nil and table.getn(device_list) > 0 then
  if table.contains(device_list, sn) then
    response.message = "Already registered."
    response.code = 409
    return
  end
else
  device_list = {}
end

-- Update device list
device_list[table.getn(device_list) + 1] = sn
Keystore.set({ key = "devices", value = to_json(device_list)})

-- Add device name to its KeyStore
device.name = name
kv_write(sn, device)

response.message = device_list
response.code = 200

-- -------------------------------------------------------------------------------------------------------------------

--#ENDPOINT GET /admin/{email}/users
-- Get list of users.
local user = currentUser(request)
if user ~= nil then
  if getUserRoleByEmail(request.parameters.email) ~= 'admin' then
    http_error(403, response)
    return
  end

  local users = {}
-- Append role of each user
  for _, user in ipairs(User.listUsers()) do
    local user_role = getUserRoleByEmail(user.email)
    user["role"] = user_role
    if role ~= "admin" then
      local device = {}
      local index = 1
      local roles = User.listUserRoles({id = user.id})
      for _, role in ipairs(roles) do
        for _, parameter in ipairs(role.parameters) do
          if parameter.name == "sn" then
            local device_info = kv_read(parameter.value)
            local dev = {}
            dev["sn"] = parameter.value
            dev["name"] = device_info.name
            device[index] = dev
            index = index + 1
          end
        end
      end
      user["devices"] = device
    end

    table.insert(users, user)
  end

  response.message = users

else
  http_error(403, response)
end

-- -------------------------------------------------------------------------------------------------------------------

--#ENDPOINT POST /admin/{email}/assign
-- Assign device to the given user.
local user = currentUser(request)

-- Only administrators can manage other users!
if user ~= nil and getUserRoleByEmail(user.email) == 'admin' then
  local sn = request.body.serialnumber

  -- only add device if the Product event handler has
  -- heard from it (see event_handler/product.lua)
  local device = kv_read_opt(sn, false)
  if device == nil then
    response.message = "This device did not upload any data."
    response.code = 404
    return
  end

  --  Check whether this device is already assigned before.
  local user_id = request.body.user_id
  local is_exist = false
  local roles = User.listUserRoles({id = user_id})
  for _, role in ipairs(roles) do
    for _, parameter in ipairs(role.parameters) do
      if parameter.name == "sn" then
        if parameter.value == sn then
          is_exist = true
          break
        end
      end
    end
  end
  if is_exist == true then
    response.message = "Already registered."
    response.code = 400
    return
  end

  -- Assign new deivce to this user
  User.createRole({role_id = "guest", parameter = {{name = "sn"}}})
  local resp = User.assignUser({
        id = user_id,
        roles = {{
          role_id = "guest",
          parameters = {{
            name = "sn",
            value = sn
          }}
        }}
      })
  if resp ~= nil and resp.status ~= nil then
    response.message = resp.error
    response.code = resp.status
    return
  else
    --Respond the name of assigned device
    response.message = kv_read(sn).name
  end

else
  http_error(403, response)
end

-- -------------------------------------------------------------------------------------------------------------------

--#ENDPOINT POST /admin/{email}/dismiss
-- Dismiss a device from the user
local user = currentUser(request)

-- Only administrators can manage other users!
if user ~= nil and getUserRoleByEmail(user.email) == 'admin' then
  local user_id = request.body.user_id
  local sn = request.body.serialnumber
  local roles = User.listUserRoles({id = user_id})
  for _, role in ipairs(roles) do
    local parameters = {
      ["role_id"] = role.role_id,
      ["parameter_name"] = "sn",
      ["parameter_value"] = sn
    }
    User.deleteRoleParamValue(parameters)
  end
else
  http_error(403, response)
end
-- -------------------------------------------------------------------------------------------------------------------

--#ENDPOINT POST /admin/{email}/delete
-- Delete user
local user = currentUser(request)

-- Only administrators can manage other users!
if user ~= nil and getUserRoleByEmail(user.email) == 'admin' then
  local user_id = request.body.user_id
  local parameters = {
    ["id"] = user_id,
    ["keys"] = {"role"}
  }
  User.deleteUserData(parameters)
  response.message = User.deleteUser({["id"] = user_id})
else
  http_error(403, response)
end
-- -------------------------------------------------------------------------------------------------------------------

--#ENDPOINT POST /admin/{email}/sender_phone
-- Save Twilio SMS sender's phone number
local user = currentUser(request)

-- Only administrators can manage sender's phone number
if user ~= nil and getUserRoleByEmail(user.email) == 'admin' then
  local sender_phone = request.body.sender_phone
  Keystore.set({key = "sms_sender_phone", value = to_json(sender_phone)})
  response.message = 'OK'
else
  http_error(403, response)
end
-- -------------------------------------------------------------------------------------------------------------------

--#ENDPOINT GET /admin/{email}/sender_phone
-- Get Twilio SMS sender's phone number
local user = currentUser(request)
-- Only administrators can manage sender's phone number
if user ~= nil and getUserRoleByEmail(user.email) == 'admin' then
  local result = Keystore.get(({ key = "sms_sender_phone" })).value
  if result ~= nil then
    response.message = string.sub(result, 2, -2)
  else
    response.message = 'Not set'
  end
else
  http_error(403, response)
end
-- -------------------------------------------------------------------------------------------------------------------


--#ENDPOINT GET /user/{email}/pools
-- Get a list of pools associated with user with email {email}
local user = currentUser(request)
if user ~= nil then
  local list = {}
--  If user is the administrator, return all devices.
--  Otherwise, return devices associated to his role.
  if getUserRoleByEmail(user.email) == 'admin' then
    local sn_list = {}
    local resp = Keystore.get({key = "devices"})
    if type(resp) == "table" and type(resp.value) == "string" then
      sn_list = from_json(resp.value)
    end
    if sn_list ~= nil and table.getn(sn_list) > 0 then
      for _, sn in pairs(sn_list) do
        local device_info = kv_read(sn)
        if device_info == nil then
          print("device_info returned from kv_read is nil in " ..
            "GET /user/{email}/pools for sn " .. sn)
        else
          device_info.type = "full"
          device_info.serialnumber = sn
          table.insert(list, device_info)
        end
      end
    end
  else
    local roles = User.listUserRoles({id = user.id})
    for _, role in ipairs(roles) do
      for _, parameter in ipairs(role.parameters) do
        if parameter.name == "sn" then
          local device_info = kv_read(parameter.value)
          if device_info == nil then
            print("device_info returned from kv_read is nil in " ..
              "GET /user/{email}/pools for sn " .. parameter.value)
          else
            if role.role_id == "owner" then
              device_info.type = "full"
            else
              device_info.type = "readonly"
            end
            device_info.serialnumber = parameter.value
            table.insert(list, device_info)
          end
        end
      end
    end
  end
  response.headers["Content-type"] = "application/json; charset=utf-8"
  if table.getn(list) == 0 then
    return '[]'
  else
    return list
  end
else
  http_error(403, response)
end

-- -------------------------------------------------------------------------------------------------------------------

--#ENDPOINT POST /user/{email}/pool
-- Update pool's name
local user = currentUser(request)
if user ~= nil then
  local sn = request.body.serialnumber
  local device = kv_read(sn)
  if device == nil then
    response.code = 404
    response.message = 'Not found'
  end
  device.name = request.body.pool_name
  kv_write(sn, device)
  response.message = 'OK'
else
  http_error(403, response)
end

-- -------------------------------------------------------------------------------------------------------------------

--#ENDPOINT POST /user/{email}/dismiss_alert
local user = currentUser(request)

if user == nil or user.id == nil then
  http_error(403, response)
  return
else
  local sn = tostring(request.body.serialnumber);
  local data = kv_read(sn)
  data['alert'] = nil
  kv_write(sn, data)
  response.message = 'OK'
end

-- -------------------------------------------------------------------------------------------------------------------

--#ENDPOINT POST /user/{email}/get_pool/{sn}
-- Get a list of sensor data of a pool associated with user with email {email}, sn {sn}
local user = currentUser(request)
if user ~= nil then
  local sn = tostring(request.parameters.sn)
  local alias = request.body.alias
  if alias == nil then
    return {"error", "alias must be specified..." }
  end

  local limit = request.body.limit
  if limit == nil then
    limit = 300
  elseif limit > 1000 then
    limit = 1000
  end

  local metrics = {"value", "user", "action"}
  local tags = {
    sn = sn,
    alias = alias
  }
  local start_time = request.body.start_time
  if start_time == 'error' then
    start_time = nil
  end
  local end_time = request.body.end_time
  if end_time == 'error' then
    end_time = nil
  end
  local server_response = Tsdb.query({
    metrics = metrics,
    tags = tags,
    limit = limit,
    relative_start = start_time,
    relative_end = end_time,
    fill = "null",
    epoch = "s"
  })
  response.message = server_response.values
else
  http_error(403, response)
end

-- -------------------------------------------------------------------------------------------------------------------

--#ENDPOINT GET /user/{email}/delete_pool/{sn}
-- Remove a pool from the KeyStore and delete role param from User servce.
local sn = tostring(request.parameters.sn)
local user = currentUser(request)
if user ~= nil then
  -- Remove corresponding role param from User service
  local roles = User.listUserRoles({id = user.id})
  for _, role in ipairs(roles) do
    local parameters = {
      ["role_id"] = role.role_id,
      ["parameter_name"] = "sn",
      ["parameter_value"] = sn
    }
    User.deleteRoleParamValue(parameters)
  end
  -- Remove from KeyStore & "devices" Key as well if administrator deletes this device permantantely.
  if getUserRoleByEmail(user.email) == 'admin' then
    kv_delete(sn)
    local resp = Keystore.get({key = "devices"})
    local sn_list = from_json(resp.value)
    for i, s in ipairs(sn_list) do
      if s == sn then
        table.remove(sn_list, i)
      end
    end
    Keystore.set({ key = "devices", value = to_json(sn_list)})
  end
else
  http_error(403, response)
end

-- -------------------------------------------------------------------------------------------------------------------

-- -------------------------------------------------------------------------------------------------------------------

--#ENDPOINT POST /user/{email}/update_pool/{sn}
-- Append field value of a pool associated with user with email {email}, sn {sn}
local user = currentUser(request)
if user ~= nil then
  local sn = tostring(request.parameters.sn)
  local alias = request.body.alias
  if alias == nil then
    return {"error", "alias must be specified..." }
  end

  local value = request.body.value
  if value == nil then
    return {"error", "value must be specified..." }
  end

  local action = request.body.action
  if action == nil then
    return {"error", "action must be specified..." }
  end

-- Update Keystore as well
  local data = kv_read(sn)
  data[alias] = value
  kv_write(sn, data)

-- Update dataport
  write(sn, alias, value)

-- Update TSDB
  local metrics = {
    value = value,
    action = action,
    user = request.parameters.email
  }
  local tags = {
    sn = sn,
    alias = alias,
    action = action
  }

  local server_response = Tsdb.write({
    metrics = metrics,
    tags = tags
  })
  response.message = server_response
else
  http_error(403, response)
end

-- -------------------------------------------------------------------------------------------------------------------

--#ENDPOINT GET /user/{email}/alert/{type}
-- Get a list of Alert configuration associated with user with email {email}
local user = currentUser(request)
local alert_type = tostring(request.parameters.type)
if user ~= nil then
  local list = {}
  local roles = User.listUserRoles({id = user.id})
  for _, role in ipairs(roles) do
    for _, parameter in ipairs(role.parameters) do
      if parameter.name == alert_type then
        table.insert(list, parameter.value)
      end
    end
  end
  response.headers["Content-type"] = "application/json; charset=utf-8"
  if table.getn(list) == 0 then
    return '[]'
  else
    return list
  end
else
  http_error(403, response)
end

-- -------------------------------------------------------------------------------------------------------------------
--#ENDPOINT POST /user/{email}/add_alert/{type}
-- add user alert configuration associated with user email
local user = currentUser(request)
local alert_type = tostring(request.parameters.type)
if user ~= nil then
  -- Add user `email` param
  local parameters = {
  ["role_id"] = "guest",
  ["body"] = {
      {
        ["name"] = alert_type
      }
    }
  }
  User.addRoleParam(parameters)

  local alert_value = request.body.alert_value
  local resp = User.assignUser({
        id = user.id,
        roles = {{
          role_id = "guest",
          parameters = {{
            name = alert_type,
            value = alert_value
          }}
        }}
      })
  response.message = resp
else
  http_error(403, response)
end


-- -------------------------------------------------------------------------------------------------------------------
--#ENDPOINT POST /user/{email}/delete_alert/{type}
-- delete user alert email associated with user email
local user = currentUser(request)
local alert_type = tostring(request.parameters.type)
if user ~= nil then
  local alert_value = request.body.alert_value
  local roles = User.listUserRoles({id = user.id})
  for _, role in ipairs(roles) do
    local parameters = {
      ["role_id"] = role.role_id,
      ["parameter_name"] = alert_type,
      ["parameter_value"] = alert_value
    }
    User.deleteRoleParamValue(parameters)
  end
else
  http_error(403, response)
end
-- -------------------------------------------------------------------------------------------------------------------

--#ENDPOINT GET /user/{email}
local user = currentUser(request)
if user ~= nil and user.email == request.parameters.email then
  return User.listUserData({id = user.id})
else
  http_error(403, response)
end

-- -------------------------------------------------------------------------------------------------------------------

--#ENDPOINT POST /user/{email}/shared/
local sn = tostring(request.body.serialnumber)
local user = currentUser(request)
if user ~= nil then
  local isowner = User.hasUserRoleParam({
    id = user.id,
    role_id = "owner",
    parameter_name = "sn",
    parameter_value = sn
  })
  if 'OK' == isowner then
    local guest = User.listUsers({filter = "email::like::" .. request.parameters.email})
    if #guest == 1 and guest[1].id ~= nil then
      local resp = User.assignUser({
        id = guest[1].id,
        roles = {{
          role_id = "guest",
          parameters = {{
            name = "sn",
            value = sn
          }}
        }}
      });
      return {"ok", resp}
    else
      return {"error", "user not found"}
    end
  end
end
http_error(403, response)

-- -------------------------------------------------------------------------------------------------------------------

--#ENDPOINT DELETE /user/{email}/shared/{sn}
local sn = request.parameters.sn
local user = currentUser(request)
if user ~= nil then
  local isowner = User.hasUserRoleParam({
    id = user.id, role_id = "owner", parameter_name = "sn", parameter_value = sn
  })
  if isowner == 'OK' then
    local guestusers = User.listRoleParamUsers({
      role_id = "guest", parameter_name = "sn", parameter_value = sn
    })
    if guestusers ~= nil then
      for _, guestid in ipairs(guestusers) do
        local guest = User.getUser({id=guestid})
        if guest.email == request.parameters.email then
          local result = User.deassignUserParam({
            id = guest.id, role_id = "guest", parameter_name = "sn", parameter_value = sn
          })
          return result
        end
      end
    end
  end
end
http_error(403, response)

-- -------------------------------------------------------------------------------------------------------------------

--#ENDPOINT GET /user/{email}/shared/
local user = currentUser(request)
if user ~= nil then
  if user.email ~= request.parameters.email then
    http_error(403, response)
  else
    local roles = User.listUserRoles({id=user.id})
    local list = {}
    for _, role in ipairs(roles) do
      if role.role_id == "owner" then
        for _, parameter in ipairs(role.parameters) do
          if parameter.name == "sn" then
            local sn = parameter.value
            local user_info = {serialnumber=sn, email=user.email, type="full"}
            table.insert(list, user_info)
            local guestusers = User.listRoleParamUsers({
              role_id = "guest", parameter_name = "sn", parameter_value = parameter.value
            })
            if guestusers ~= nil then
              for _, guestid in ipairs(guestusers) do
                local guest = User.getUser({id=guestid})
                local guest_info = {serialnumber=sn, email=guest.email, type="readonly"}
                table.insert(list, guest_info)
              end
            end
          end
        end
      end
    end
    return list
  end
end
http_error(403, response)

-- -------------------------------------------------------------------------------------------------------------------

--#ENDPOINT GET /pool/{sn}
-- get details about a particular pool
local sn = tostring(request.parameters.sn)
local user = currentUser(request)
if user ~= nil then
  local isowner = User.hasUserRoleParam({
    id = user.id, role_id = "owner", parameter_name = "sn", parameter_value = sn
  })
  local isguest = User.hasUserRoleParam({
    id = user.id, role_id = "guest", parameter_name = "sn", parameter_value = sn
  })
  if isowner == 'OK' or isguest == 'OK' then
    return kv_read(sn)
  else
    http_error(403, response)
  end
else
  http_error(403, response)
end

-- -------------------------------------------------------------------------------------------------------------------

--#ENDPOINT GET /debug-command/{cmd}
response.message = debug(request.parameters.cmd)

-- -------------------------------------------------------------------------------------------------------------------

--#ENDPOINT WEBSOCKET /debug
response.message = debug(websocket_info.message)

-- -------------------------------------------------------------------------------------------------------------------

--#ENDPOINT WEBSOCKET /listen
response.message = listen(websocketInfo)

-- -------------------------------------------------------------------------------------------------------------------

--#ENDPOINT GET /_init
local ret1 = User.createRole({role_id = "owner", parameter = {{name = "sn"}}})
local ret2 = User.createRole({role_id = "guest", parameter = {{name = "sn"}}})
local ret = ret1.status_code ~= nil and ret1 or nil
if ret == nil then
  ret = ret2.status_code ~= nil and ret2 or nil
end
if ret ~= nil then
  response.code = ret.status_code
  response.message = ret.message
else
  response.code = 200
end

-- -------------------------------------------------------------------------------------------------------------------

--#ENDPOINT POST /tmp/{email}/kv_write/{sn}
local user = currentUser(request)

if user == nil or user.id == nil then
  http_error(403, response)
  return
else
  local sn = tostring(request.parameters.sn);
  local key = tostring(request.body.key)
  local value = tostring(request.body.value)

  local data = kv_read(sn)
  data[key] = value
  kv_write(sn, data)
  response.message = 'OK'
end