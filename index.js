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
            if(menu === "RegisterHut"){
               await registerHut();
            } else if(menu === "Book"){
                await bookingHut();
            } else if(menu === "List"){
                await listBookings();
            } else if(menu === "Summary"){
                await summaryHut();
            } else if(menu === "Cancel"){
                await cancelBooking();
            } else if(menu === "Exit"){
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
    const name = await ask ("Hut name: ");
        if(!validateInput(name, "string", "Hut name")) return;
    const data = loadData();
    const hut = data.huts.find(h => h.name === name);
        if(!hut){
            console.log("The hut doesn't exist.");
            return;
        }
    const tramper = await ask ("Tramper name: ");
        if(!validateInput(tramper, "string", "Tramper name")) return;
    const date = await ask ("Arrival date (DDMMYYY): ");
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


    const newBooking = {
        id: data.bookings.length + 1,
        hutId: hut.id,
        hutName: name,
        tramperName: tramper,
        arrivalDate : Number(date),
        nights: nightsNum,
        partySize: sizeNum
    };

    data.bookings.push(newBooking);
    saveData(data);
    console.log("Your booking is successfully registered!");
}


async function listBookings() {
    const data = loadData();
    const date = await ask ("Date (DDMMYYY): ");
        if(!validateDate(date, "string", "Date")) return;
    const name = await ask ("Hut's name: ");
        if(!validateInput(name, "string","Hut's name")) return;
    const hut = data.huts.find(h => h.name === name);  //find method is for identifying a specific value.
        if(!hut){
                console.log("The hut doesn't exist.");
                return;
            }
    const bookings = data.bookings.filter(b => b.hutId === hut.id && b.arrivalDate === Number(date));  //filter method is for identifying a range of specific value.

    if(bookings.length === 0){
        console.log("The booking doesn't exist");
        return;
    }

    bookings.forEach(b => {
        console.log(`ID: ${b.id}, Tramper: ${b.tramperName}, Party size: ${b.partySize}, Nights: ${b.nights}`);
    });
}

const validateDate = (value) => {
    if(value.length !== 8 || isNaN(value)){
        console.log("Date must be in DDMMYYYY format (e.g. 24072004)");
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
    console.log(`Occupancy of ${hut.name} - ${capacity}%`);
    });
}


async function cancelBooking() {
    const data = loadData();
    const name = await ask ("Tramper name: ");
        if(!validateInput(name, "string", "Hut name")) return;
    const date = await ask ("Arrival date(DDMMYYYY): ");
        if(!validateDate(date, "number", "Arrival date")) return;
    const booking = data.bookings.find(b => b.tramperName === name && b.arrivalDate === Number(date));
        if(!booking){
                console.log("The booking doesn't exist.");
                return;
            }
    data.bookings = data.bookings.filter(b => b.id !== booking.id);   //filter() method is for maintaining other values without specific value.  
    saveData(data);    //*filter() method only reply the new array, so necessary to save over.
    console.log("Your cancellation is completed!");
}








mainMenu();