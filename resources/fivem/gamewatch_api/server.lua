-- gamewatch_api: HTTP endpoints for Gamewatch dashboard
-- GET /players  — online player positions
-- GET /blips    — map blips (collected from connected clients)

local cachedBlips = {}

-- Receive blip data from connected clients
RegisterNetEvent('gamewatch_api:blipSync')
AddEventHandler('gamewatch_api:blipSync', function(blips)
    if type(blips) == 'table' then
        cachedBlips = blips
    end
end)

SetHttpHandler(function(req, res)
    if req.method ~= 'GET' then
        res.writeHead(405)
        res.send('Method Not Allowed')
        return
    end

    if req.path == '/players' then
        local players = {}
        for _, playerId in ipairs(GetPlayers()) do
            local ped = GetPlayerPed(playerId)
            if ped and ped ~= 0 then
                local coords = GetEntityCoords(ped)
                table.insert(players, {
                    id        = tonumber(playerId),
                    name      = GetPlayerName(playerId),
                    ping      = GetPlayerPing(playerId),
                    x         = coords.x,
                    y         = coords.y,
                    z         = coords.z,
                })
            end
        end
        res.writeHead(200, {
            ['Content-Type']                 = 'application/json',
            ['Access-Control-Allow-Origin']  = '*',
        })
        res.send(json.encode(players))

    elseif req.path == '/blips' then
        res.writeHead(200, {
            ['Content-Type']                 = 'application/json',
            ['Access-Control-Allow-Origin']  = '*',
        })
        res.send(json.encode(cachedBlips))

    else
        res.writeHead(404)
        res.send('Not Found')
    end
end)
