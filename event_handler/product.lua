--[[
  data
  The data from the device

  data.api enum string (write|record)
  Provider API

  data.rid string
  Unique device resource id

  data.seq integer
  The message sequence number for specific resource id

  data.alias string
  Device resource alias

  data.value table{1 = "live"|timestamp, 2 = value}
  Data transmitted by the device

  data.vendor string
  Device vendor identifier

  data.device_sn string
  Device Serial number

  data.source_ip string
  The device source ip

  data.timestamp integer
  Event time
--]]

Timeseries.write({
  query = data.alias .. ",sn=" .. data.device_sn .. " value=" .. tostring(data.value[2])
})

-- Save incoming data into TSDB.
local tags = {
  sn = data.device_sn,
  alias = tostring(data.alias)
}
local metrics = {
  value = tostring(data.value[2])
}
Tsdb.write({
  metrics = metrics,
  tags = tags
})

-- If received alias is `alert`, just send alerts to users.
if data.alias == "alert" then
  send_alerts(data.device_sn, tostring(data.value[2]))
else
  -- Check Key Store and update with the latest value
  local value = kv_read(data.device_sn)
  if value == nil then
    value = {
      pH = nil,
      Temperature = nil,
      ORP = nil,
      pH_setpoint = nil,
      ORP_setpoint = nil,
      Flow = nil,
      alert = nil,
    }
  end

  value[data.alias] = data.value[2]
  -- store the last timestamp from this device
  value["timestamp"] = data.timestamp/1000
  value["pid"] = data.vendor or data.pid
  value["ip"] = data.source_ip
  value["rid"] = data.rid

  local listen = value.listen
  if listen ~= nil and listen.sn ~= nil and listen.socket_id ~= nil and listen.server_ip then
    if data.device_sn == listen.sn then
      local msg = {
        sn = listen.sn,
        alias = data.alias,
        timestamp = data.value[1],
        value = data.value[2]
      }
      Websocket.send({
        socket_id = listen.socket_id,
        server_ip = listen.server_ip,
        message = to_json(msg),
        type="data-text"
      })
    end
  end

  -- Save last sensor/output data, device information to Key Store
  kv_write(data.device_sn, value)
end


