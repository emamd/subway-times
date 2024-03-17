const swipeInData = []

const swipeOutData = []

const tripsInProgress = {}

const allTripData = {}

const stations = ['Grand Central', '14th Street', 'Broadway Junction', '36th Avenue']

const createTrips = function(n=100) {
    const numberOfStations = stations.length; 

    for (let i = 1; i < n + 1; i++) {
        const cardId = i;
        // Pick origin and destination stations at random 
        const originStation = stations[Math.floor(Math.random() * numberOfStations)]; 
        
        // Now is as good a time as any 
        const originTime = new Date(Date.now());
        let destinationStation = stations[Math.floor(Math.random() * numberOfStations)];
        
        // add a random time less than an hour
        // this requires some transcending of space + time 
        // and highly irregular train service, 
        // but why not, for demo purposes. 
        // Could also get the distance between each station combo 
        // and populate allTripData with that, then use that as a modifier 
        const destinationTime = new Date(Date.now() + (Math.floor(Math.random() * (60 * 60 * 1000))))

        // The destination can't be the same as the origin. Try again! 
        while (destinationStation === originStation) {
            destinationStation = stations[Math.floor(Math.random() * numberOfStations)];
        }
        
        swipeInData.push({
            cardId: cardId,
            station: originStation, 
            time: originTime
        });

        swipeOutData.push({
            cardId: cardId,
            station: destinationStation,
            time: destinationTime
        })
    }
}


// create a trip key out of two stations as a function
// so it can be changed in one place 
// in case we decide to change the format later 
const createTripKey = function(origin, destination) {
    return `${origin}-${destination}`
}

const swipeIn = function(cardId, station, time) {
    // add trip data to tripsInProgress data object
    // We don't need to do more at this time 
    // this could also be a Map(), but an object is easy enough to work with 
    // and we don't need the features of a Map 
    tripsInProgress[cardId] = { station, time }
}

const swipeOut = function (cardId, station, time) {
    // Fetch that card's data from tripsInProgress
    const entryData = tripsInProgress[cardId];

    // then determine the trip duration
    const duration = time - entryData.time;

    // Create the origin-destination data to use as a key 
    // in the stationData object
    // this could be a Map, but there's no real need to preserve order 
    // so an object is fine 
    const tripKey = createTripKey(entryData.station, station);

    // Delete the origin trip data - we don't need it anymore 
    // plus, that cardId will want to make other trips
    // and you can't have two trips happening at once 
    delete tripsInProgress[cardId];

    // if that trip doesn't exist yet in our data, then initialize it
    // otherwise, add the duration to the total duration
    // and increment the number of trips 
    if (!allTripData[tripKey]) {
        allTripData[tripKey] = {
            totalDuration: duration,
            trips: 1
        }
    } else {
        allTripData[tripKey].totalDuration += duration;
        allTripData[tripKey].trips++; 
    }

}


const calculateAverageTimes = function(origin, destination) {
    // Retrieve the travel segment data from the "database"
    const tripKey = createTripKey(origin, destination);
    const tripData = allTripData[tripKey];

    // and return the average - duration / number of trips
    // in minutes 
    return (tripData.totalDuration / tripData.trips) / 1000 / 60;
}

const main = function() {
    createTrips(1000);

    // Initialize all entry trips 
    // In the real world, entries and exits would happen continuously, 
    // not as a nice little process here 
    for (let i = 0; i < swipeInData.length; i++) {
        const { cardId, station, time } = swipeInData[i]; 
        swipeIn(cardId, station, time);
    }

    for (let i = 0; i < swipeOutData.length; i++) {
        const { cardId, station, time } = swipeOutData[i];
        swipeOut(cardId, station, time);
    }

    // Sort the trip keys that we have so it's alphabetized 
    // when we print out the data 
    const tripKeys = Object.keys(allTripData).sort();
    
    console.log("Average trip times:")
    for (let i = 0; i < tripKeys.length; i++) {
        const tripName = tripKeys[i];
        const [origin, destination] = tripName.split('-');
        
        console.log(`${tripName}: ${calculateAverageTimes(origin, destination).toFixed(1)} minutes`);
    }
}

main();