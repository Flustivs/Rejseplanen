const baseurl = "https://xmlopen.rejseplanen.dk/bin/rest.exe/";

async function GetResult(event) {
    event.preventDefault();

    let location = document.getElementById('location').value;
    let destination = document.getElementById('destination').value;

    try {
        let lresponse = await fetch(baseurl + "location?input=" + location + "&format=json");
        let dresponse = await fetch(baseurl + "location?input=" + destination + "&format=json");

        if (!lresponse.ok) {
            throw new Error("Network response was not ok for location: " + lresponse.statusText);
        }
        if (!dresponse.ok) {
            throw new Error("Network response was not ok for destination: " + dresponse.statusText);
        }

        let ldata = await lresponse.json();
        let ddata = await dresponse.json();
        if (ldata.LocationList.StopLocation.length > 0 && ddata.LocationList.StopLocation.length > 0) {
            let originId = ldata.LocationList.StopLocation[0].id;
            let destId = ddata.LocationList.StopLocation[0].id;

            let tripsResponse = await fetch(baseurl + "trip?originId=" + originId + "&destId=" + destId + "&format=json");
            if (!tripsResponse.ok) {
                throw new Error("Network response was not ok for trip: " + tripsResponse.statusText);
            }

            let tripsData = await tripsResponse.json();
            console.log("Trip Details:", tripsData);

            let resultbox = document.getElementById("result");
            resultbox.innerHTML = '';

            tripsData.TripList.Trip.forEach(trip => {
                if (Array.isArray(trip.Leg)) {
                    trip.Leg.forEach(leg => {
                        let text = document.createElement('p');
                        text.innerHTML = `Tog/Bus/Til fods: ${leg.name} <br>
                                          Fra: ${leg.Origin.name} at ${leg.Origin.time} <br>
                                          Til: ${leg.Destination.name} at ${leg.Destination.time}`;
                        resultbox.appendChild(text);
                    });
                } else {
                    let text = document.createElement('p');
                    text.innerHTML = `Tog/Bus/Til fods: ${trip.Leg.name} <br>
                                      Fra: ${trip.Leg.Origin.name} at ${trip.Leg.Origin.time} <br>
                                      Til: ${trip.Leg.Destination.name} at ${trip.Leg.Destination.time}`;
                    resultbox.appendChild(text);
                }
            });
        } else {
            throw new Error("No valid locations found for the given input.");
        }
    } catch (error) {
        console.error("Fetch error: ", error);
        document.getElementById('result').innerText = "Error: " + error.message;
    }
}
