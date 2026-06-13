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
                await cancelHut();
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
    if(value === ""){
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
    const date = await ask ("Arrival date: ");
        if(!validateInput(date, "string", "Arrival date")) return;
    const nights = await ask ("Nights: ");
        if(!validateInput(nights, "number", "Nights")) return;
        const nightsNum = Number(nights);
    const size = await ask ("Party size: ");
        if(!validateInput(size, "number", "Party size")) return;
        const sizeNum = Number(size);


    const newBooking = {
        id: data.bookings.length + 1,
        hutId: hut.id,
        hutName: name,
        tramperName: tramper,
        arrivalDate: date,
        nights: nightsNum,
        partySize: sizeNum
    };

    data.bookings.push(newBooking);
    saveData(data);
    console.log("Your booking is successfully registered!");
}


mainMenu()