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
            MakeTrips(tripsData);

        } else {
            throw new Error("No valid locations found for the given input.");
        }
    } catch (error) {
        console.error("Fetch error: ", error);
        document.getElementById('result').innerText = "Error: " + error.message;
    }
}

function MakeTrips(tripsData) {
    let resultbox = document.getElementById("result");
    resultbox.innerHTML = '';

    // Loops through each Trip
    tripsData.TripList.Trip.forEach(trip => {
        let tripbox = document.createElement('div');
        tripbox.className = "tripbox";

        let triptitle = document.createElement('p');
        if (Array.isArray(trip.Leg)) {
            triptitle.innerHTML = "Fra: " + trip.Leg[0].Origin.name + " Kl. " + trip.Leg[0].Origin.time;
            triptitle.innerHTML += " Til: " + trip.Leg[trip.Leg.length - 1].Destination.name + " Kl. " + trip.Leg[trip.Leg.length - 1].Destination.time;
        } else {
            triptitle.innerHTML = "Fra: " + trip.Leg.Origin.name + " Kl. " + trip.Leg.Origin.time;
            triptitle.innerHTML += " Til: " + trip.Leg.Destination.name + " Kl. " + trip.Leg.Destination.time;
        }

        let detailbox = document.createElement('div');
        detailbox.className = "detailbox";

        // If leg has multiple shifts, it loops through each and prints them out
        if (Array.isArray(trip.Leg)) {
            trip.Leg.forEach(leg => {
                let text = document.createElement('p');
                text.innerHTML = `${TravelType(leg)} <br>
                  Fra: ${leg.Origin.name} at ${leg.Origin.time} <br>
                  ${leg.Origin.track ? `Spor: ${leg.Origin.track} <br>` : ''}
                  Til: ${leg.Destination.name} at ${leg.Destination.time} <br>
                  ${leg.Destination.track ? `Spor: ${leg.Destination.track}` : ''}`;
                detailbox.appendChild(text);
            });
        } else {
            let text = document.createElement('p');
            text.innerHTML = `${TravelType(trip.Leg)} <br>
                                      Fra: ${trip.Leg.Origin.name} at ${trip.Leg.Origin.time} <br>
                                      ${trip.Leg.Origin.track ? `Spor: ${trip.Leg.Origin.track} <br>` : ''}
                                      Til: ${trip.Leg.Destination.name} at ${trip.Leg.Destination.time}
                                      ${trip.Leg.Destination.track ? `Spor: ${trip.Leg.Destination.track}` : ''}`;
            detailbox.appendChild(text);
        }

        let detailbutton = document.createElement('button');
        detailbutton.className = "detailbutton";
        detailbutton.onclick = ToggleDetails;
        detailbutton.innerHTML = "Detaljer";

        tripbox.appendChild(triptitle);
        tripbox.appendChild(detailbutton);
        tripbox.appendChild(detailbox);
        resultbox.appendChild(tripbox);
        resultbox.style.visibility = "visible";
    });
}
// use to switch on the "Til fods/tog/bus"
function TravelType(leg){
    switch(leg.type){
        case "WALK":
            return "Til fods";
        case "BUS":
            return "Bus: " + leg.line;
        case "REG" || "LYN" || "IC":
            return "Tog: " + leg.name;
    }
}

function ToggleDetails(event) {
    let detailbox = event.target.nextElementSibling;
    detailbox.style.display = detailbox.style.display === "none" ? "block" : "none";
}
