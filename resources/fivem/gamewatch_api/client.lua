-- gamewatch_api/client.lua
-- Collects map blips and sends to server periodically

local function collectBlips()
    local blips = {}
    -- Iterate through known sprite range (0-826)
    for sprite = 0, 826 do
        local blip = GetFirstBlipInfoId(sprite)
        while DoesBlipExist(blip) do
            local display = GetBlipInfoIdDisplay(blip)
            -- Only include blips shown on the main map
            if display == 2 or display == 4 or display == 5 or display == 8 then
                local coords = GetBlipCoords(blip)
                -- Skip blips at origin (0,0,0) — usually invalid
                if not (coords.x == 0.0 and coords.y == 0.0 and coords.z == 0.0) then
                    blips[#blips + 1] = {
                        sprite  = sprite,
                        x       = math.floor(coords.x * 100) / 100,
                        y       = math.floor(coords.y * 100) / 100,
                        z       = math.floor(coords.z * 100) / 100,
                        color   = GetBlipColour(blip),
                        alpha   = GetBlipAlpha(blip),
                        display = display,
                    }
                end
            end
            blip = GetNextBlipInfoId(sprite)
        end
    end
    return blips
end

-- Send blips to server every 30 seconds
CreateThread(function()
    -- Wait for game to fully load
    while not NetworkIsSessionStarted() do
        Wait(500)
    end
    Wait(5000) -- extra wait for resources to create their blips

    while true do
        local blips = collectBlips()
        TriggerServerEvent('gamewatch_api:blipSync', blips)
        Wait(30000)
    end
end)
