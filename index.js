import readline from "readline";
import fs from "fs";   //This is necessary for importing and exporting to data.json

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


//This function is for displaying a question from readline and waiting until user enters.
function ask(q) {
    return new Promise(resolve => rl.question(q, resolve));
}


async function mainMenu() {
    while(true){
        const menu = await ask ("Enter Command: [RegisterHut, Book, List, Summary, Cancel, Exit]: ");
        const command = menu.trim().toLowerCase();   //trim() method is for removing space before and after.
            if(command === "registerhut"){
               await registerHut();
            } else if(command === "book"){
                await bookingHut();
            } else if(command === "list"){
                await listBookings();
            } else if(command === "summary"){
                await summaryHut();
            } else if(command === "cancel"){
                await cancelBooking();
            } else if(command === "exit"){
                await exitWork();
            } else {
                console.log("the command doesn’t exist");
            }
        }
}




//This code is for loading the data from data.json
const loadData = () => {
    try {
        return JSON.parse(fs.readFileSync("data.json", "utf8"));
    } catch(err) {
        console.log("Data file not found or corrupt. Starting with empty data.");
        return { huts: [], bookings: [] }
    }
}

//This code if for saving the data into data.json
const saveData = (data) => {
    fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
}


const validateInput = (value, type, fieldName) => {
    if(value.trim() === ""){
        console.log(`${fieldName} can not be empty`);
        return false;
    }
    if(type === "string" && !isNaN(value)){
        console.log(`${fieldName} must be text, not a number`);
        return false;
    }
    if(type === "number" && (isNaN(Number(value)) || Number(value) <= 0)){
        console.log(`${fieldName} must be a positive number`);
        return false;
    }
    return true;
}


//This function is for registering a hut.
async function registerHut() {
    const name = await ask ("Name: ");
        if(!validateInput(name, "string", "Name")) return;
    const location = await ask ("Location: ");
        if(!validateInput(location, "string", "Location")) return;
    const walk = await ask ("Walk: ");
        if(!validateInput(walk, "string", "Walk")) return;
    const capacity = await ask ("Capacity: ");
        if(!validateInput(capacity, "number", "Capacity")) return;
        const capacityNum = Number(capacity);

    const data = loadData(); //need to load data.json for maintaining existing data. *if you don't load the json file, your new data will over write to the existing data.

    const newHut = {
        id: data.huts.length + 1,
        name: name,
        location: location,
        walk: walk,
        capacity: capacityNum
    };

    data.huts.push(newHut); //push method is for adding new elements into the array
    saveData(data);
    console.log("Your hut is successfully registered!");
}


async function bookingHut() {
    const data = loadData();  
        if(data.huts.length === 0){
        console.log("No huts registered yet.");
        return;
        }
    const name = await ask ("Hut name: ");
        if(!validateInput(name, "string", "Hut name")) return;
    const hut = data.huts.find(h => h.name === name);
        if(!hut){
            console.log("The hut doesn't exist.");
            return;
        }
    const tramper = await ask ("Tramper name: ");
        if(!validateInput(tramper, "string", "Tramper name")) return;
    const date = await ask ("Arrival date (DD-MM-YYY): ");
        if(!validateDate(date)) return;
    const nights = await ask ("Nights: ");
        if(!validateInput(nights, "number", "Nights")) return;
        const nightsNum = Number(nights);
        if(nightsNum >= 10){
            console.log("Nights must be less than 10.");
            return;
        }
    const size = await ask ("Party size: ");
        if(!validateInput(size, "number", "Party size")) return;

        const sizeNum = Number(size);

        if(!validateCapacity(data, hut.id, date, nightsNum, sizeNum)){
            console.log("Capacity over on the day.");
            return;
        }

    const duplicate = data.bookings.find(b => b.hutId === hut.id && b.tramperName === tramper && b.arrivalDate === date);

    if(duplicate){
        console.log("This booking already exists.");
        return;
    };

    const newBooking = {
        id: data.bookings.length + 1,
        hutId: hut.id,
        hutName: name,
        tramperName: tramper,
        arrivalDate : date,
        nights: nightsNum,
        partySize: sizeNum
    };

    data.bookings.push(newBooking);
    saveData(data);
    console.log("Your booking is successfully registered!");
}


async function listBookings() {
    const data = loadData();
    const date = await ask ("Date (DD-MM-YYY): ");
        if(!validateInput(date, "string", "Date")) return;
    const name = await ask ("Hut's name: ");
        if(!validateInput(name, "string","Hut's name")) return;
    const hut = data.huts.find(h => h.name === name);  //find method is for identifying a specific value.
        if(!hut){
                console.log("The hut doesn't exist.");
                return;
            }
    const bookings = data.bookings.filter(b => {       //filter method is for identifying a range of specific value.
        if(b.hutId !== hut.id) return false;
        
        const existSegments = b.arrivalDate.split("-");
        const existDay = Number(existSegments[0]);
        const existMonth = Number(existSegments[1]);
        const existYear = Number(existSegments[2]);
        const existArrival = new Date(existYear, existMonth - 1, existDay);
        
        const existDeparture = new Date(existArrival);
        existDeparture.setDate(existArrival.getDate() + b.nights);
        
        const searchSegments = date.split("-");
        const searchDay = Number(searchSegments[0]);
        const searchMonth = Number(searchSegments[1]);
        const searchYear = Number(searchSegments[2]);
        const searchDate = new Date(searchYear, searchMonth - 1, searchDay);
        
        return searchDate >= existArrival && searchDate < existDeparture;
    });  

    if(bookings.length === 0){
        console.log("The booking doesn't exist");
        return;
    }

    bookings.forEach(b => {
        console.log(`ID: ${b.id}, Tramper: ${b.tramperName}, Party size: ${b.partySize}, Nights: ${b.nights}`);
    });

    const total = bookings.reduce((sum, b) => sum + b.partySize, 0);
    const remaining = hut.capacity - total;
    console.log(`Remaining capacity on this day: ${remaining}`);
}

const validateDate = (value) => {

    const segments = value.split("-");
    if (segments.find(s => Number.isNaN(Number(s)))){      //Number.isNaN() is a method for confirming whether the value is not a number.
        console.log("Date must be a number");
    }
    
    const day = Number(segments[0]);
    const month = Number(segments[1]);
    const year = Number(segments[2]);

    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
        if(year < currentYear){
            console.log("You must be in the future.");
            return false;
        } else if (month < currentMonth && year === currentYear){
            console.log("You must be in the future.");
            return false;
        } else if (day < currentDay && month === currentMonth && year === currentYear){
            console.log("You must be in the future.")
            return false;
        } 
    

    return true;
}


function summaryHut() {
    const data = loadData();
    const group = data.bookings.reduce((acc, b) => {  //reduce() method is combine an array into a value.
        const date = b.arrivalDate;
        if(!acc[date]){
            acc[date] = [];
        }
        acc[date].push(b);
        return acc;

    }, {});

    Object.keys(group).forEach(date => {         //object.keys() method is for converting object to an array.  *forEach() can't use for object.
    const bookings = group[date];
    const total = bookings.reduce((sum, b) => sum + b.partySize, 0);     //This is for calculating the total people on the day. 
    const hut = data.huts.find(h => h.id === bookings[0].hutId);    //This if for identifying the hut.
    const capacity = total / hut.capacity * 100;       //this is a calculation for total capacity on the day.

    console.log(`[${date}]`);
    bookings.forEach(b => {
        console.log(`${b.hutName} - (ID: ${b.id}, ${b.partySize} people)`);
    });
    console.log(`Occupancy of ${hut.name} - ${capacity.toFixed(1)}%`);  //tofixed() method is for adjusting the decimal point.
    });
}


async function cancelBooking() {
    const data = loadData();
    const name = await ask ("Tramper name: ");
        if(!validateInput(name, "string", "Tramper name")) return;
    const date = await ask ("Arrival date(DD-MM-YYYY): ");
        if(!validateInput(date, "string", "Arrival date")) return;
    const booking = data.bookings.find(b => b.tramperName === name && b.arrivalDate === date);
        if(!booking){
                console.log("The booking doesn't exist.");
                return;
            }
    data.bookings = data.bookings.filter(b => b.id !== booking.id);   //filter() method is for maintaining other values without specific value.  
    saveData(data);    //*filter() method only reply the new array, so necessary to save over.
    console.log("Your cancellation is completed!");
}


async function exitWork() {
    const answer = await ask ("Are you sure to finish this work? ");
        if(answer.toLowerCase() === "yes"){
            console.log("complete this work");
            rl.close();
            process.exit();
        } else {
            return
        }
}


const validateCapacity = (data, hutId, arrivalDate, nights, partySize) => {
    const hut = data.huts.find(h => h.id === hutId);
    const segments = arrivalDate.split("-");
    
    const day = Number(segments[0]);
    const month = Number(segments[1]);
    const year = Number(segments[2]);
    const arrival = new Date(year, month - 1, day);  //JavaScript counts on months from 0. i.g.) if the input is 7 month, JavaScript recognizes it as 8 month.

    for(let i = 0; i < nights; i++){
    const checkDate = new Date(arrival);   //new Date() method is for making a date object.
    checkDate.setDate(arrival.getDate() + i);  //getDate() method is for getting date from the object. setDate() method is for changing the date in the object.
    const total = data.bookings.reduce((sum, b) => {
        if(b.hutId !== hutId) return sum;  
            const existSegments = b.arrivalDate.split("-");
            const existDay = Number(existSegments[0]);
            const existMonth = Number(existSegments[1]);
            const existYear = Number(existSegments[2]);
            const existArrival = new Date(existYear, existMonth - 1, existDay);

            const existDeparture = new Date(existArrival);
            existDeparture.setDate(existArrival.getDate() + b.nights); //This code is for showing the departure date.

            if(checkDate >= existArrival && checkDate < existDeparture){
                return sum + b.partySize;
            }
            return sum;

    }, 0);

      if(total + partySize > hut.capacity){
        return false;
      }
    }
    return true;
}





mainMenu();

